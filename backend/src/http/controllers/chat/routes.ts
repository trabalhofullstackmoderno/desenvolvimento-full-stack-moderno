import { FastifyInstance } from 'fastify'
import { createConversation, getConversations } from './conversations'
import { getMessages, sendMessage, markMessageAsRead } from './messages'
import { syncContacts, searchContacts, getRegisteredContacts, findUserByEmail } from './contacts'
import { verifyJWT } from '@/middlewares/verify-jwt'

export async function chatRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  // Conversation operations
  app.post('/conversations', createConversation)
  app.get('/conversations', getConversations)

  // Message operations
  app.get('/conversations/:conversationId/messages', getMessages)
  app.post('/conversations/:conversationId/messages', sendMessage)
  app.put('/messages/:messageId/read', markMessageAsRead)

  // Contact operations
  app.post('/contacts/sync', syncContacts)
  app.get('/contacts/search', searchContacts)
  app.get('/contacts/registered', getRegisteredContacts)
  app.get('/contacts/find-by-email', findUserByEmail)
}