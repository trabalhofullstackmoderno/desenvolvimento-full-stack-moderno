"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Badge,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material'
import {
  Circle as OnlineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import axios from '@/auth/axios'

interface Contact {
  googlePersonId: string
  name: string
  email?: string
  phoneNumber?: string
  photoUrl?: string
  isRegistered?: boolean
  registeredUser?: {
    id: string
    name: string
    picture: string
    isOnline: boolean
    lastSeen: Date
  }
}

interface ContactsListProps {
  onContactSelect: (contactEmail: string) => void
}

const ContactsList: React.FC<ContactsListProps> = ({ onContactSelect }) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/contacts/registered')
      setContacts(response.data.contacts || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
      setError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const syncContacts = async () => {
    setSyncing(true)
    setError(null)

    try {
      await axios.post('/contacts/sync')
      await loadContacts()
    } catch (error) {
      console.error('Error syncing contacts:', error)
      setError('Failed to sync contacts')
    } finally {
      setSyncing(false)
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Available Contacts
          </Typography>
          <Button
            size="small"
            startIcon={syncing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={syncContacts}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''} using this app
        </Typography>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Contacts list */}
      <List disablePadding>
        {contacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No contacts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sync your Google contacts to find friends using this app
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={syncContacts}
              disabled={syncing}
            >
              Sync Contacts
            </Button>
          </Box>
        ) : (
          contacts.map((contact) => (
            <React.Fragment key={contact.googlePersonId}>
              <ListItemButton
                onClick={() => contact.email && onContactSelect(contact.email)}
                disabled={!contact.isRegistered}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      contact.registeredUser?.isOnline ? (
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
                      src={contact.registeredUser?.picture || contact.photoUrl}
                      alt={contact.name}
                      sx={{ width: 48, height: 48 }}
                    >
                      {contact.name[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: contact.isRegistered ? 'normal' : 'normal',
                        color: contact.isRegistered ? 'text.primary' : 'text.disabled'
                      }}
                    >
                      {contact.registeredUser?.name || contact.name}
                    </Typography>
                  }
                  secondary={
                    <Box component="span">
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                        {contact.email}
                      </Typography>
                      {contact.isRegistered && contact.registeredUser && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          {contact.registeredUser.isOnline
                            ? 'Online'
                            : formatLastSeen(contact.registeredUser.lastSeen)
                          }
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  )
}

export default ContactsList