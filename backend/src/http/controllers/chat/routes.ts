import { FastifyInstance } from 'fastify'
import { createConversation, getConversations } from './conversations'
import { getMessages, sendMessage, markMessageAsRead } from './messages'
import { syncContacts, searchContacts, getRegisteredContacts, findUserByEmail } from './contacts'
import { verifyJWT } from '@/middlewares/verify-jwt'

export async function chatRoutes(app: FastifyInstance) {
  // Register protected routes
  app.register(async function (fastify) {
    fastify.addHook('onRequest', verifyJWT)

    // Conversation operations
    fastify.post('/conversations', createConversation)
    fastify.get('/conversations', getConversations)

    // Message operations
    fastify.get('/conversations/:conversationId/messages', getMessages)
    fastify.post('/conversations/:conversationId/messages', sendMessage)
    fastify.put('/messages/:messageId/read', markMessageAsRead)

    // Contact operations
    fastify.post('/contacts/sync', syncContacts)
    fastify.get('/contacts/search', searchContacts)
    fastify.get('/contacts/registered', getRegisteredContacts)
    fastify.get('/contacts/find-by-email', findUserByEmail)
  })
}