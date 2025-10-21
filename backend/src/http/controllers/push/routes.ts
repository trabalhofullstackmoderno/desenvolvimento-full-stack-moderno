import { FastifyInstance } from 'fastify'
import { subscribePush, unsubscribePush, getVapidPublicKey } from './subscribe'

export async function pushRoutes(app: FastifyInstance) {
  // Public route for VAPID key
  app.get('/push/vapid-public-key', getVapidPublicKey)

  // Protected routes
  app.addHook('onRequest', app.authenticate)
  app.post('/push/subscribe', subscribePush)
  app.delete('/push/unsubscribe', unsubscribePush)
}