import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub

    const user = await prisma.user.findUnique({
      where: { googleId: userId },
      select: {
        id: true,
        googleId: true,
        email: true,
        name: true,
        picture: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true
      }
    })

    if (!user) {
      return reply.status(404).send({ message: 'User not found' })
    }

    return reply.send({ user })
  } catch (error) {
    console.error('Error getting user info:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}