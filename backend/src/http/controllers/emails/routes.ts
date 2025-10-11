import { FastifyInstance } from 'fastify'
import { sendEmail } from './send'
import { getThreads, getThread } from './threads'
import { syncEmails, syncContacts } from './sync'
import { searchEmails, searchContacts } from './search'
import { markEmailAsRead } from './mark-read'

export async function emailRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate)

  // Email operations
  app.post('/emails/send', sendEmail)
  app.put('/emails/:emailId/read', markEmailAsRead)

  // Thread operations
  app.get('/emails/threads', getThreads)
  app.get('/emails/threads/:threadId', getThread)

  // Sync operations
  app.post('/emails/sync', syncEmails)
  app.post('/contacts/sync', syncContacts)

  // Search operations
  app.get('/emails/search', searchEmails)
  app.get('/contacts/search', searchContacts)
}