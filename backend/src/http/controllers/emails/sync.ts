import { FastifyRequest, FastifyReply } from 'fastify'
import { EmailService } from '@/services/email-service'
import { GoogleContactsService } from '@/services/google-contacts-service'

export async function syncEmails(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub

    const emailService = new EmailService()
    await emailService.syncEmails(userId)

    return reply.send({ message: 'Emails synced successfully' })
  } catch (error) {
    console.error('Error syncing emails:', error)
    return reply.status(500).send({ message: 'Failed to sync emails' })
  }
}

export async function syncContacts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub

    const contactsService = new GoogleContactsService()
    await contactsService.syncUserContacts(userId)

    return reply.send({ message: 'Contacts synced successfully' })
  } catch (error) {
    console.error('Error syncing contacts:', error)
    return reply.status(500).send({ message: 'Failed to sync contacts' })
  }
}