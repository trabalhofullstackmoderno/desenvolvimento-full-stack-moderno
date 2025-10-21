import { FastifyInstance } from 'fastify'
import { subscribePush, unsubscribePush, getVapidPublicKey } from './subscribe'
import { verifyJWT } from '@/middlewares/verify-jwt'

export async function pushRoutes(app: FastifyInstance) {
  // Public route for VAPID key
  app.get('/push/vapid-public-key', getVapidPublicKey)

  // Protected routes
  app.addHook('onRequest', verifyJWT)
  app.post('/push/subscribe', subscribePush)
  app.delete('/push/unsubscribe', unsubscribePush)
}