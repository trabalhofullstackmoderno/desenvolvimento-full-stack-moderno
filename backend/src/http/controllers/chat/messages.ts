import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { WebSocketService } from '@/services/websocket-service'

const getMessagesParamsSchema = z.object({
  conversationId: z.string().uuid()
})

const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

const sendMessageBodySchema = z.object({
  content: z.string().min(1),
  messageType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE']).default('TEXT'),
  mediaUrl: z.string().optional()
})

export async function getMessages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { conversationId } = getMessagesParamsSchema.parse(request.params)
    const { limit, offset } = getMessagesQuerySchema.parse(request.query)

    // Get current user's actual ID
    const currentUser = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return reply.status(404).send({ message: "Current user not found" });
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      }
    })

    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, picture: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUser.id },
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return reply.send({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        limit,
        offset,
        hasMore: messages.length === limit
      }
    })
  } catch (error) {
    console.error('Error getting messages:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.errors
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { conversationId } = getMessagesParamsSchema.parse(request.params)
    const { content, messageType, mediaUrl } = sendMessageBodySchema.parse(request.body)

    // Get current user's actual ID
    const currentUser = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return reply.status(404).send({ message: "Current user not found" });
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id }
        ]
      }
    })

    if (!conversation) {
      return reply.status(404).send({ message: 'Conversation not found' })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: currentUser.id,
        content,
        messageType,
        mediaUrl,
        isDelivered: true,
        deliveredAt: new Date()
      },
      include: {
        sender: {
          select: { id: true, name: true, picture: true }
        }
      }
    })

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date()
      }
    })

    // Broadcast message via WebSocket
    const wsService = WebSocketService.getInstance()

    // Get the other user ID to send notification
    const otherUserId = conversation.user1Id === currentUser.id ?
      conversation.user2Id : conversation.user1Id

    // Send to recipient if online
    wsService.sendToUser(otherUserId, {
      type: 'new_message',
      data: {
        ...message,
        conversationId
      }
    })

    // Send confirmation to sender
    wsService.sendToUser(currentUser.id, {
      type: 'message_sent',
      data: {
        ...message,
        conversationId
      }
    })

    return reply.status(201).send({ message })
  } catch (error) {
    console.error('Error sending message:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.errors
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}

export async function markMessageAsRead(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub
    const { messageId } = z.object({ messageId: z.string().uuid() }).parse(request.params)

    // Get current user's actual ID
    const currentUser = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return reply.status(404).send({ message: "Current user not found" });
    }

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          OR: [
            { user1Id: currentUser.id },
            { user2Id: currentUser.id }
          ]
        }
      }
    })

    if (!message) {
      return reply.status(404).send({ message: 'Message not found' })
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return reply.send({ message: 'Message marked as read' })
  } catch (error) {
    console.error('Error marking message as read:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.errors
      })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
}