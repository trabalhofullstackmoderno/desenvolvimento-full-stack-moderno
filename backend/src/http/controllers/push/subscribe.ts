import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodError } from 'zod'
import { PushNotificationService } from '@/services/push-notification-service'

const subscribeBodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
})

export async function subscribePush(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const subscription = subscribeBodySchema.parse(request.body)

    const pushService = new PushNotificationService()
    await pushService.subscribePush(userId, subscription)

    return reply.status(201).send({ message: 'Push subscription created successfully' })
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function unsubscribePush(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { endpoint } = z.object({ endpoint: z.string().url() }).parse(request.body)

    const pushService = new PushNotificationService()
    await pushService.unsubscribePush(userId, endpoint)

    return reply.send({ message: 'Push subscription removed successfully' })
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function getVapidPublicKey(request: FastifyRequest, reply: FastifyReply) {
  try {
    const pushService = new PushNotificationService()
    const publicKey = pushService.getVapidPublicKey()

    return reply.send({ publicKey })
  } catch (error) {
    console.error('Error getting VAPID public key:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}