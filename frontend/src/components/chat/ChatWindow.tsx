"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  InputAdornment,
  CircularProgress,
  Badge
} from '@mui/material'
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Circle as OnlineIcon
} from '@mui/icons-material'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { useWebSocket } from '@/hooks/useWebSocket'
import axios from '@/auth/axios'
import { unifaeChatTheme } from '@/theme/unifaeTheme'

interface Contact {
  id: string
  name: string
  email: string
  picture: string
  isOnline: boolean
  lastSeen: Date
}

interface Conversation {
  id: string
  contact: Contact
  lastMessage: any
  unreadCount: number
  lastMessageAt: string
  createdAt: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE'
  mediaUrl?: string
  isRead: boolean
  isDelivered: boolean
  readAt?: string
  deliveredAt?: string
  createdAt: string
  sender: {
    id: string
    name: string
    picture: string
  }
}

interface ChatWindowProps {
  conversation: Conversation
  onMessageSent?: (conversationId: string, messageContent: string) => void
  onMessageReceived?: (message: any) => void
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onMessageSent, onMessageReceived }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { sendMessage: sendWebSocketMessage, lastMessage, typingUsers } = useWebSocket()

  useEffect(() => {
    if (conversation.id) {
      loadMessages()
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage)
    }
  }, [lastMessage, conversation.id])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/conversations/${conversation.id}/messages`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWebSocketMessage = (message: any) => {
    // Always notify ChatInterface about received messages (for sidebar updates)
    if (message.type === 'new_message' && onMessageReceived) {
      onMessageReceived(message);
    }

    switch (message.type) {
      case 'new_message':
        if (message.data.conversationId === conversation.id) {
          setMessages(prev => [...prev, message.data]);
        }
        break
      case 'message_sent':
        if (message.data.conversationId === conversation.id) {
          setMessages(prev => [...prev, message.data])
        }
        break
      case 'message_read':
        if (message.data.conversationId === conversation.id) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === message.data.messageId
                ? { ...msg, isRead: true, readAt: message.data.readAt }
                : msg
            )
          )
        }
        break
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Update sidebar immediately (visual only)
    if (onMessageSent) {
      onMessageSent(conversation.id, messageContent)
    }

    try {
      // Send via WebSocket for real-time delivery
      sendWebSocketMessage({
        type: 'message',
        data: {
          conversationId: conversation.id,
          content: messageContent,
          messageType: 'TEXT'
        }
      })

    } catch (error) {
      console.error('Error sending message:', error)
      // Revert the message input on error
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    // Send typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      sendWebSocketMessage({
        type: 'typing',
        data: {
          conversationId: conversation.id,
          isTyping: true
        }
      })
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        sendWebSocketMessage({
          type: 'typing',
          data: {
            conversationId: conversation.id,
            isTyping: false
          }
        })
      }
    }, 2000)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(lastSeen).getTime()
    const hours = diff / (1000 * 3600)

    if (hours < 1) {
      return 'last seen just now'
    } else if (hours < 24) {
      return `last seen ${Math.floor(hours)}h ago`
    } else {
      const days = Math.floor(hours / 24)
      return `last seen ${days}d ago`
    }
  }

  const conversationTypers = typingUsers.get(conversation.id) || []
  const otherUserTyping = conversationTypers.filter(userId => userId === conversation.contact.id)

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Chat header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          ...unifaeChatTheme.header
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                conversation.contact.isOnline ? (
                  <OnlineIcon
                    sx={{
                      width: 12,
                      height: 12,
                      color: 'success.main',
                      border: '2px solid white',
                      borderRadius: '50%'
                    }}
                  />
                ) : null
              }
            >
              <Avatar
                src={conversation.contact.picture}
                alt={conversation.contact.name}
                sx={{ width: 40, height: 40, mr: 2 }}
              >
                {conversation.contact.name[0]?.toUpperCase()}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {conversation.contact.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {conversation.contact.isOnline
                  ? 'online'
                  : formatLastSeen(conversation.contact.lastSeen)
                }
              </Typography>
            </Box>
          </Box>

          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 1,
          bgcolor: '#f5f5f5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e0e0e0" fill-opacity="0.1"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId !== conversation.contact.id}
                showAvatar={
                  index === 0 ||
                  messages[index - 1].senderId !== message.senderId
                }
                showTimestamp={
                  index === messages.length - 1 ||
                  messages[index + 1].senderId !== message.senderId ||
                  new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000
                }
              />
            ))}

            {/* Typing indicator */}
            {otherUserTyping.length > 0 && (
              <TypingIndicator
                userName={conversation.contact.name}
                avatar={conversation.contact.picture}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message input */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          borderTop: '1px solid #e0e0e0',
          bgcolor: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton size="small">
            <AttachFileIcon />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f5f5f5'
              }
            }}
          />

          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            sx={{
              bgcolor: newMessage.trim() ? 'primary.main' : 'grey.300',
              color: 'white',
              '&:hover': {
                bgcolor: newMessage.trim() ? 'primary.dark' : 'grey.400',
              },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'white'
              }
            }}
          >
            {sending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}

export default ChatWindow