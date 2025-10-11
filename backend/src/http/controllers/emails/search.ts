import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { EmailService } from '@/services/email-service'
import { GoogleContactsService } from '@/services/google-contacts-service'

const searchEmailsQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(50).default(20)
})

const searchContactsQuerySchema = z.object({
  q: z.string().min(1)
})

export async function searchEmails(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { q: query, limit } = searchEmailsQuerySchema.parse(request.query)

    const emailService = new EmailService()
    const emails = await emailService.searchEmails(userId, query, limit)

    return reply.send({ emails })
  } catch (error) {
    console.error('Error searching emails:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.errors
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function searchContacts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { q: query } = searchContactsQuerySchema.parse(request.query)

    const contactsService = new GoogleContactsService()
    const contacts = await contactsService.searchContacts(userId, query)

    return reply.send({ contacts })
  } catch (error) {
    console.error('Error searching contacts:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.errors
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}