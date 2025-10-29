import { FastifyInstance } from 'fastify'
import { subscribePush, unsubscribePush, getVapidPublicKey } from './subscribe'
import { verifyJWT } from '@/middlewares/verify-jwt'

export async function pushRoutes(app: FastifyInstance) {
  // Public route for VAPID key
  app.get('/push/vapid-public-key', getVapidPublicKey)

  // Protected routes
  app.register(async function (fastify) {
    fastify.addHook('onRequest', verifyJWT)
    fastify.post('/push/subscribe', subscribePush)
    fastify.delete('/push/unsubscribe', unsubscribePush)
  })
}