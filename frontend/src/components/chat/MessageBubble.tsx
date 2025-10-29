"use client"

import React from 'react'
import {
  Box,
  Typography,
  Avatar,
  Paper
} from '@mui/material'
import {
  DoneAll as DeliveredIcon,
  Done as SentIcon,
  Schedule as PendingIcon
} from '@mui/icons-material'
import { unifaeChatTheme } from '@/theme/unifaeTheme'

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

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  showTimestamp: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  showTimestamp
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = () => {
    if (!isOwn) return null

    if (message.isRead) {
      return <DeliveredIcon sx={{ fontSize: 16, color: 'info.main' }} />
    } else if (message.isDelivered) {
      return <DeliveredIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
    } else {
      return <SentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: showTimestamp ? 2 : 0.5,
        alignItems: 'flex-end'
      }}
    >
      {/* Avatar for received messages */}
      {!isOwn && (
        <Avatar
          src={message.sender.picture}
          alt={message.sender.name}
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            visibility: showAvatar ? 'visible' : 'hidden'
          }}
        >
          {message.sender.name[0]?.toUpperCase()}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start'
        }}
      >
        {/* Message bubble */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: 2,
            ...(isOwn ? unifaeChatTheme.messageFromUser : unifaeChatTheme.messageFromOther),
            borderBottomRightRadius: isOwn && showAvatar ? 4 : 16,
            borderBottomLeftRadius: !isOwn && showAvatar ? 4 : 16,
            wordBreak: 'break-word'
          }}
        >
          {/* Media content */}
          {message.messageType === 'IMAGE' && message.mediaUrl && (
            <Box sx={{ mb: 1 }}>
              <img
                src={message.mediaUrl}
                alt="Shared image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px'
                }}
              />
            </Box>
          )}

          {/* Text content */}
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4
            }}
          >
            {message.content}
          </Typography>

          {/* Message metadata */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5,
              opacity: 0.8
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: isOwn ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
              }}
            >
              {formatTime(message.createdAt)}
            </Typography>
            {getStatusIcon()}
          </Box>
        </Paper>

        {/* Timestamp */}
        {showTimestamp && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 0.5,
              mx: 1,
              fontSize: '0.7rem'
            }}
          >
            {new Date(message.createdAt).toLocaleDateString()} {formatTime(message.createdAt)}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default MessageBubble