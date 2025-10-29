import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodError } from 'zod'
import { EmailService } from '@/services/email-service'

const getThreadsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

const getThreadParamsSchema = z.object({
  threadId: z.string().uuid()
})

export async function getThreads(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { limit, offset } = getThreadsQuerySchema.parse(request.query)

    const emailService = new EmailService()
    const threads = await emailService.getThreads(userId, limit, offset)

    return reply.send({
      threads,
      pagination: {
        limit,
        offset,
        hasMore: threads.length === limit
      }
    })
  } catch (error) {
    console.error('Error getting threads:', error)

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function getThread(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { threadId } = getThreadParamsSchema.parse(request.params)

    const emailService = new EmailService()
    const thread = await emailService.getThreadById(userId, threadId)

    return reply.send({ thread })
  } catch (error) {
    console.error('Error getting thread:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.issues
      })
    }

    if (error instanceof Error && error.message === 'Thread not found') {
      return reply.status(404).send({ message: 'Thread not found' })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}