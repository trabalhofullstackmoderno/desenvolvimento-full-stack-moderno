"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
  Button
} from '@mui/material'
import {
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material'
import axios from 'axios'

interface Email {
  id: string
  fromEmail: string
  toEmail: string
  ccEmails: string[]
  bccEmails: string[]
  subject: string
  textBody: string
  htmlBody: string
  isRead: boolean
  isStarred: boolean
  sentAt: string
  attachments: any[]
}

interface EmailThreadData {
  id: string
  threadId: string
  subject: string
  emails: Email[]
}

interface EmailThreadProps {
  threadId: string
  onReply: (email: string, subject: string, body: string) => void
}

const EmailThread: React.FC<EmailThreadProps> = ({ threadId, onReply }) => {
  const [thread, setThread] = useState<EmailThreadData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (threadId) {
      loadThread()
    }
  }, [threadId])

  const loadThread = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/emails/threads/${threadId}`)
      setThread(response.data.thread)

      // Auto-expand the latest email
      if (response.data.thread.emails.length > 0) {
        const latestEmailId = response.data.thread.emails[response.data.thread.emails.length - 1].id
        setExpandedEmails(new Set([latestEmailId]))
      }
    } catch (error) {
      console.error('Error loading thread:', error)
      setError('Failed to load email thread')
    } finally {
      setLoading(false)
    }
  }

  const toggleEmailExpansion = (emailId: string) => {
    const newExpanded = new Set(expandedEmails)
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId)
    } else {
      newExpanded.add(emailId)
    }
    setExpandedEmails(newExpanded)
  }

  const markAsRead = async (emailId: string) => {
    try {
      await axios.put(`/api/emails/${emailId}/read`)
      // Refresh thread to update read status
      loadThread()
    } catch (error) {
      console.error('Error marking email as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getEmailPreview = (email: Email) => {
    const text = email.textBody || email.htmlBody?.replace(/<[^>]*>/g, '') || ''
    return text.substring(0, 100) + (text.length > 100 ? '...' : '')
  }

  const extractEmailName = (email: string) => {
    const match = email.match(/^(.+)<(.+)>$/)
    if (match) {
      return match[1].trim()
    }
    return email.split('@')[0]
  }

  const handleReply = (email: Email) => {
    onReply(email.fromEmail, email.subject, email.textBody || '')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!thread) {
    return null
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'white' }}>
      {/* Thread header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #ddd', bgcolor: '#f8f9fa' }}>
        <Typography variant="h5" gutterBottom>
          {thread.subject || 'No Subject'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {thread.emails.length} message{thread.emails.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Email list */}
      <Box sx={{ p: 2 }}>
        {thread.emails.map((email, index) => {
          const isExpanded = expandedEmails.has(email.id)
          const isLatest = index === thread.emails.length - 1

          return (
            <Paper
              key={email.id}
              elevation={1}
              sx={{
                mb: 2,
                border: !email.isRead ? '2px solid #1976d2' : '1px solid #ddd',
                bgcolor: !email.isRead ? '#f3f8ff' : 'white'
              }}
            >
              {/* Email header */}
              <Box
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={() => {
                  toggleEmailExpansion(email.id)
                  if (!email.isRead) {
                    markAsRead(email.id)
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                      {extractEmailName(email.fromEmail)[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {extractEmailName(email.fromEmail)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {email.fromEmail}
                      </Typography>
                      {!isExpanded && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {getEmailPreview(email)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                      {formatDate(email.sentAt)}
                    </Typography>
                    <IconButton size="small">
                      {email.isStarred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton size="small">
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* CC/BCC chips */}
                {isExpanded && (email.ccEmails.length > 0 || email.bccEmails.length > 0) && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {email.ccEmails.map((ccEmail, i) => (
                      <Chip key={i} label={`CC: ${ccEmail}`} size="small" variant="outlined" />
                    ))}
                    {email.bccEmails.map((bccEmail, i) => (
                      <Chip key={i} label={`BCC: ${bccEmail}`} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Email content */}
              <Collapse in={isExpanded}>
                <Divider />
                <Box sx={{ p: 2 }}>
                  {/* Email body */}
                  <Box
                    sx={{ mb: 2, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{
                      __html: email.htmlBody || email.textBody?.replace(/\n/g, '<br>') || ''
                    }}
                  />

                  {/* Attachments */}
                  {email.attachments && email.attachments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments:
                      </Typography>
                      {email.attachments.map((attachment, i) => (
                        <Chip
                          key={i}
                          label={attachment.filename}
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<ReplyIcon />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReply(email)
                      }}
                    >
                      Reply
                    </Button>
                    <Button
                      startIcon={<ReplyAllIcon />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implement reply all
                      }}
                    >
                      Reply All
                    </Button>
                    <Button
                      startIcon={<ForwardIcon />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Implement forward
                      }}
                    >
                      Forward
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}

export default EmailThread