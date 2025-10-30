"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  Pagination,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material'
import EmailComposer from './EmailComposer'
import EmailThread from './EmailThread'
import NotificationSetup from '../notifications/NotificationSetup'
import axios from 'axios'

interface EmailThreadData {
  id: string
  threadId: string
  subject: string
  lastEmail: string
  latestEmailPreview: string
  emailCount: number
}

const EmailInbox: React.FC = () => {
  const [threads, setThreads] = useState<EmailThreadData[]>([])
  const [selectedThread, setSelectedThread] = useState<EmailThreadData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [syncing, setSyncing] = useState(false)

  const threadsPerPage = 20

  useEffect(() => {
    loadThreads()
  }, [page])

  const loadThreads = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/emails/threads', {
        params: {
          limit: threadsPerPage,
          offset: (page - 1) * threadsPerPage
        }
      })

      setThreads(response.data.threads)
      setTotalPages(Math.ceil(response.data.total / threadsPerPage))
    } catch (error) {
      console.error('Error loading threads:', error)
      setError('Falha ao carregar emails')
    } finally {
      setLoading(false)
    }
  }

  const syncEmails = async () => {
    setSyncing(true)
    try {
      await axios.post('/api/emails/sync')
      await loadThreads()
    } catch (error) {
      console.error('Error syncing emails:', error)
      setError('Falha ao sincronizar emails')
    } finally {
      setSyncing(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadThreads()
      return
    }

    setLoading(true)
    try {
      const response = await axios.get('/api/emails/search', {
        params: { q: searchQuery }
      })

      // Transform search results to thread format
      const searchThreads = response.data.emails.map((email: any) => ({
        id: email.thread.id,
        threadId: email.thread.threadId,
        subject: email.subject || 'Sem Assunto',
        lastEmail: email.sentAt,
        latestEmailPreview: email.textBody?.substring(0, 150) || '',
        emailCount: 1
      }))

      setThreads(searchThreads)
    } catch (error) {
      console.error('Error searching emails:', error)
      setError('Falha ao buscar emails')
    } finally {
      setLoading(false)
    }
  }

  const handleThreadSelect = (thread: EmailThreadData) => {
    setSelectedThread(thread)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar with thread list */}
      <Box sx={{ width: 400, borderRight: '1px solid #ddd', bgcolor: 'white' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Caixa de Entrada</Typography>
            <IconButton onClick={syncEmails} disabled={syncing}>
              {syncing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Buscar emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Notification setup */}
        <Box sx={{ p: 2 }}>
          <NotificationSetup />
        </Box>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Thread list */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <List disablePadding>
                {threads.map((thread) => (
                  <React.Fragment key={thread.id}>
                    <ListItemButton
                      selected={selectedThread?.id === thread.id}
                      onClick={() => handleThreadSelect(thread)}
                      sx={{ px: 2, py: 1 }}
                    >
                      <ListItemText
                        primary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              variant="subtitle2"
                              component="span"
                              sx={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '250px'
                              }}
                            >
                              {thread.subject || 'Sem Assunto'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span">
                              {formatDate(thread.lastEmail)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block'
                              }}
                            >
                              {thread.latestEmailPreview}
                            </Typography>
                            {thread.emailCount > 1 && (
                              <Chip
                                label={`${thread.emailCount} mensagens`}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Main content area */}
      <Box sx={{ flex: 1, bgcolor: '#f5f5f5' }}>
        {selectedThread ? (
          <EmailThread
            threadId={selectedThread.id}
            onReply={(email, subject, body) => {
              setComposerOpen(true)
              // You can pass reply data to composer here
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Selecione um email para ler
            </Typography>
            <Typography variant="body2">
              Escolha um email da lista para ver seu conteúdo
            </Typography>
          </Box>
        )}
      </Box>

      {/* Compose button */}
      <Fab
        color="primary"
        aria-label="compose"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setComposerOpen(true)}
      >
        <EditIcon />
      </Fab>

      {/* Email composer dialog */}
      <EmailComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </Box>
  )
}

export default EmailInbox