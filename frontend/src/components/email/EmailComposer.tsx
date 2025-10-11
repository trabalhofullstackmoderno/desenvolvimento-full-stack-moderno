"use client"

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  IconButton,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useContacts } from '@/hooks/useContacts'
import axios from 'axios'

interface EmailComposerProps {
  open: boolean
  onClose: () => void
  replyTo?: {
    email: string
    subject: string
    body: string
  }
}

interface Contact {
  email: string
  name: string
}

interface Attachment {
  file: File
  name: string
  size: number
}

const EmailComposer: React.FC<EmailComposerProps> = ({ open, onClose, replyTo }) => {
  const [to, setTo] = useState<Contact[]>(replyTo ? [{ email: replyTo.email, name: replyTo.email }] : [])
  const [cc, setCc] = useState<Contact[]>([])
  const [bcc, setBcc] = useState<Contact[]>([])
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '')
  const [body, setBody] = useState(replyTo ? `\n\n--- Original Message ---\n${replyTo.body}` : '')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { searchContacts, loading: contactsLoading } = useContacts()

  const handleSend = async () => {
    if (!to.length || !subject.trim()) {
      setError('Please provide recipient and subject')
      return
    }

    setSending(true)
    setError(null)

    try {
      const emailData = {
        to: to[0].email, // For simplicity, sending to first recipient
        cc: cc.map(c => c.email),
        bcc: bcc.map(c => c.email),
        subject,
        htmlBody: body.replace(/\n/g, '<br>'),
        textBody: body,
        attachments: attachments.map(att => ({
          filename: att.name,
          content: Buffer.from(att.file as any).toString('base64'),
          contentType: att.file.type
        }))
      }

      await axios.post('/api/emails/send', emailData)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        resetForm()
      }, 1500)
    } catch (error) {
      console.error('Error sending email:', error)
      setError('Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setTo([])
    setCc([])
    setBcc([])
    setSubject('')
    setBody('')
    setAttachments([])
    setShowCc(false)
    setShowBcc(false)
    setError(null)
    setSuccess(false)
  }

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        file,
        name: file.name,
        size: file.size
      }))
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {replyTo ? 'Reply' : 'Compose Email'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Email sent successfully!
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            options={[]}
            value={to}
            onChange={(_, newValue) => setTo(newValue)}
            onInputChange={async (_, inputValue) => {
              if (inputValue.trim()) {
                await searchContacts(inputValue)
              }
            }}
            loading={contactsLoading}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="To"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {contactsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name || option.email}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
          />
        </Box>

        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          {!showCc && (
            <Button
              size="small"
              onClick={() => setShowCc(true)}
              variant="text"
            >
              Cc
            </Button>
          )}
          {!showBcc && (
            <Button
              size="small"
              onClick={() => setShowBcc(true)}
              variant="text"
            >
              Bcc
            </Button>
          )}
        </Box>

        {showCc && (
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={[]}
              value={cc}
              onChange={(_, newValue) => setCc(newValue)}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Cc" fullWidth />
              )}
            />
          </Box>
        )}

        {showBcc && (
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={[]}
              value={bcc}
              onChange={(_, newValue) => setBcc(newValue)}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Bcc" fullWidth />
              )}
            />
          </Box>
        )}

        <TextField
          label="Subject"
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Message"
          fullWidth
          multiline
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          sx={{ mb: 2 }}
        />

        {attachments.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Attachments:
            </Typography>
            {attachments.map((attachment, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Box>
                  <Typography variant="body2">{attachment.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(attachment.size)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeAttachment(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileAttach}
          multiple
          style={{ display: 'none' }}
        />
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<AttachFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        >
          Attach
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
          onClick={handleSend}
          disabled={sending || !to.length || !subject.trim()}
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmailComposer