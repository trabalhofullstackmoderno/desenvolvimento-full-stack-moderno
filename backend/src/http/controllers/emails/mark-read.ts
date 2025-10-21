import { FastifyRequest, FastifyReply } from 'fastify'
import { z, ZodError } from 'zod'
import { EmailService } from '@/services/email-service'

const markReadParamsSchema = z.object({
  emailId: z.string().uuid()
})

export async function markEmailAsRead(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { emailId } = markReadParamsSchema.parse(request.params)

    const emailService = new EmailService()
    await emailService.markAsRead(userId, emailId)

    return reply.send({ message: 'Email marked as read' })
  } catch (error) {
    console.error('Error marking email as read:', error)

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}