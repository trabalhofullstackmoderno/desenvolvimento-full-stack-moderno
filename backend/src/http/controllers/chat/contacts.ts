import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { GoogleContactsService } from '@/services/google-contacts-service'
import { prisma } from '@/lib/prisma'

const searchContactsQuerySchema = z.object({
  q: z.string().min(1)
})

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

export async function getRegisteredContacts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub

    const contactsService = new GoogleContactsService()
    const contacts = await contactsService.getContacts(userId)

    return reply.send({ contacts })
  } catch (error) {
    console.error('Error getting registered contacts:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

const findUserByEmailSchema = z.object({
  email: z.string().email()
})

export async function findUserByEmail(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { email } = findUserByEmailSchema.parse(request.query)

    // Get current user's actual ID
    const currentUser = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return reply.status(404).send({ message: "Current user not found" });
    }

    const contactsService = new GoogleContactsService()
    const user = await contactsService.findUserByEmail(email)

    if (!user) {
      return reply.status(404).send({
        message: 'User not found',
        exists: false
      })
    }

    // Don't allow finding yourself
    if (user.id === currentUser.id) {
      return reply.status(400).send({
        message: 'Cannot add yourself as a contact',
        exists: false
      })
    }

    return reply.send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      },
      exists: true
    })
  } catch (error) {
    console.error('Error finding user by email:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Invalid email format',
        errors: error.errors
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}