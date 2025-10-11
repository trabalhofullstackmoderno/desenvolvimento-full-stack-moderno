"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Avatar,
  Button,
  Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  Circle as OnlineIcon
} from '@mui/icons-material'
import axios from '@/auth/axios'

interface User {
  id: string
  name: string
  email: string
  picture: string
  isOnline: boolean
  lastSeen: Date
}

interface ContactSearchProps {
  open: boolean
  onClose: () => void
  onSelectContact: (contactEmail: string) => void
}

const ContactSearch: React.FC<ContactSearchProps> = ({ open, onClose, onSelectContact }) => {
  const [email, setEmail] = useState('')
  const [foundUser, setFoundUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!email.trim()) return

    setLoading(true)
    setError(null)
    setFoundUser(null)

    try {
      const response = await axios.get('/contacts/find-by-email', {
        params: { email: email.trim() }
      })

      if (response.data.exists) {
        setFoundUser(response.data.user)
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('User not found. Make sure they have registered with this email.')
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid email format')
      } else {
        setError('Error searching for user. Please try again.')
      }
      console.error('Error finding user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = () => {
    if (foundUser) {
      onSelectContact(foundUser.email)
      setEmail('')
      setFoundUser(null)
      setError(null)
    }
  }

  const handleClose = () => {
    setEmail('')
    setFoundUser(null)
    setError(null)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(lastSeen).getTime()
    const hours = diff / (1000 * 3600)

    if (hours < 1) {
      return 'Online'
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Start a new conversation</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the email address of the person you want to chat with
        </Typography>

        <TextField
          fullWidth
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="example@email.com"
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {foundUser && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 2
            }}
          >
            <Avatar
              src={foundUser.picture}
              alt={foundUser.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {foundUser.name[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {foundUser.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {foundUser.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {foundUser.isOnline && (
                  <OnlineIcon
                    sx={{
                      width: 8,
                      height: 8,
                      color: 'success.main',
                      mr: 0.5
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {foundUser.isOnline ? 'Online' : formatLastSeen(foundUser.lastSeen)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        {foundUser ? (
          <Button
            variant="contained"
            onClick={handleStartChat}
          >
            Start Chat
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!email.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Find User'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ContactSearch