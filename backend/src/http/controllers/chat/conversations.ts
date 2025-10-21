import { FastifyRequest, FastifyReply } from "fastify";
import { z, ZodError } from 'zod'
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const createConversationBodySchema = z.object({
  contactEmail: z.string().email(),
});

const getConversationsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function createConversation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;
    const { contactEmail } = createConversationBodySchema.parse(request.body);

    // Validate that the current user exists
    const currentUser = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return reply.status(404).send({ message: "Current user not found" });
    }

    // Find the contact user by email
    const contactUser = await prisma.user.findUnique({
      where: { email: contactEmail },
      select: { id: true, name: true, email: true, picture: true },
    });
    if (!contactUser) {
      return reply.status(404).send({ message: "User not found" });
    }

    if (contactUser.id === currentUser.id) {
      return reply
        .status(400)
        .send({ message: "Cannot create conversation with yourself" });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: currentUser.id, user2Id: contactUser.id },
          { user1Id: contactUser.id, user2Id: currentUser.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    if (existingConversation) {
      return reply.send({ conversation: existingConversation });
    }

    const conversation = await prisma.conversation.create({
      data: {
        user1: { connect: { id: currentUser.id } },
        user2: { connect: { id: contactUser.id } },
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: true,
      },
    });

    return reply.status(201).send({ conversation });
  } catch (error) {
    console.error("Error creating conversation:", error);

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

export async function getConversations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;
    const { limit, offset } = getConversationsQuerySchema.parse(request.query);

    // Get current user's actual ID
    const currentUser = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { id: true },
    });
    if (!currentUser) {
      return reply.status(404).send({ message: "Current user not found" });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: currentUser.id },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      skip: offset,
      take: limit,
    });

    // Format conversations for frontend
    const formattedConversations = conversations.map((conv: Prisma) => {
      const otherUser =
        conv.user1Id === currentUser.id ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        contact: otherUser,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: lastMessage.sender.name,
              createdAt: lastMessage.createdAt,
              isRead: lastMessage.isRead,
            }
          : null,
        unreadCount: conv._count.messages,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    });

    return reply.send({
      conversations: formattedConversations,
      pagination: {
        limit,
        offset,
        hasMore: conversations.length === limit,
      },
    });
  } catch (error) {
    console.error("Error getting conversations:", error);

    if(error instanceof ZodError) {
      return reply.status(400).send({ message: "Validation error", issues: error.format() })
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
