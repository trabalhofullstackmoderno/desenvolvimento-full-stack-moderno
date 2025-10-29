import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import fastifyWebsocket from "@fastify/websocket";

interface AuthenticatedSocket {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
  close: () => void;
  on: (event: string, listener: (...args: any[]) => void) => void;
  send: (data: string) => void;
}

interface WebSocketMessage {
  type: "message" | "typing" | "read" | "delivered" | "online_status";
  data: any;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async setupWebSocket(app: FastifyInstance) {
    try {
      const wsService = this;

      await app.register(fastifyWebsocket);

      app.register(async function (fastify) {
        fastify.get(
          "/ws",
          { websocket: true } as any,
          (connection: any, req: any) => {
            console.log('WebSocket connection attempt, connection object:', Object.keys(connection));
            wsService.handleConnection(
              connection.socket || connection,
              req,
            );
          },
        );
      });

      console.log("WebSocket service initialized successfully");
    } catch (error) {
      console.error("Failed to setup WebSocket service:", error);
      throw error;
    }
  }

  private async handleConnection(socket: any, req: any) {
    try {
      const token = req.query.token;
      if (!token) {
        if (socket && socket.close) {
          socket.close();
        }
        return;
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { googleId: decoded.sub },
        select: { id: true, email: true, name: true, picture: true },
      });

      if (!user) {
        if (socket && socket.close) {
          socket.close();
        }
        return;
      }

      // Create authenticated socket object
      const authenticatedSocket: AuthenticatedSocket = {
        userId: user.id,
        user: user,
        close: () => {
          if (socket && socket.close) {
            socket.close();
          }
        },
        on: (event: string, listener: (...args: any[]) => void) => {
          if (socket && socket.on) {
            socket.on(event, listener);
          }
        },
        send: (data: string) => {
          if (socket && socket.send) {
            socket.send(data);
          }
        }
      };
      this.connectedUsers.set(user.id, authenticatedSocket);

      await this.updateUserOnlineStatus(user.id, true);
      await this.broadcastOnlineStatus(user.id, true);

      authenticatedSocket.on("message", async (message: Buffer) => {
        await this.handleMessage(authenticatedSocket, message);
      });

      authenticatedSocket.on("close", async () => {
        await this.handleDisconnect(authenticatedSocket);
      });

      authenticatedSocket.send(
        JSON.stringify({
          type: "connected",
          data: { userId: user.id, status: "online" },
        }),
      );
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      if (socket && socket.close) {
        socket.close();
      }
    }
  }

  private async handleMessage(socket: AuthenticatedSocket, message: Buffer) {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
      switch (parsedMessage.type) {
        case "message":
          await this.handleChatMessage(socket, parsedMessage.data);
          break;
        case "typing":
          await this.handleTypingIndicator(socket, parsedMessage.data);
          break;
        case "read":
          await this.handleMessageRead(socket, parsedMessage.data);
          break;
        default:
          console.warn("Unknown message type:", parsedMessage.type);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: any) {
    const { conversationId, content, messageType = "TEXT", mediaUrl } = data;
    if (!socket.userId || !conversationId || !content) return;

    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ user1Id: socket.userId }, { user2Id: socket.userId }],
        },
        include: { user1: true, user2: true },
      });

      if (!conversation) return;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: socket.userId,
          content,
          messageType,
          mediaUrl,
          isDelivered: true,
          deliveredAt: new Date(),
        },
        include: {
          sender: { select: { id: true, name: true, picture: true } },
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageAt: new Date(),
        },
      });

      const otherUserId =
        conversation.user1Id === socket.userId
          ? conversation.user2Id
          : conversation.user1Id;

      socket.send(
        JSON.stringify({
          type: "message_sent",
          data: message,
        }),
      );

      const recipientSocket = this.connectedUsers.get(otherUserId);
      if (recipientSocket) {
        recipientSocket.send(
          JSON.stringify({
            type: "new_message",
            data: message,
          }),
        );
      } else {
        await this.sendPushNotification(otherUserId, {
          title: `New message from ${socket.user?.name}`,
          body: content.substring(0, 100),
          data: { conversationId, messageId: message.id },
        });
      }
    } catch (error) {
      console.error("Error handling chat message:", error);
    }
  }

  private async handleTypingIndicator(socket: AuthenticatedSocket, data: any) {
    const { conversationId, isTyping } = data;
    if (!socket.userId || !conversationId) return;

    try {
      await prisma.typingIndicator.upsert({
        where: {
          conversationId_userId: { conversationId, userId: socket.userId },
        },
        create: { conversationId, userId: socket.userId, isTyping },
        update: { isTyping, updatedAt: new Date() },
      });

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ user1Id: socket.userId }, { user2Id: socket.userId }],
        },
      });

      if (!conversation) return;

      const otherUserId =
        conversation.user1Id === socket.userId
          ? conversation.user2Id
          : conversation.user1Id;

      const otherSocket = this.connectedUsers.get(otherUserId);
      if (otherSocket) {
        otherSocket.send(
          JSON.stringify({
            type: "typing_indicator",
            data: {
              conversationId,
              userId: socket.userId,
              userName: socket.user?.name,
              isTyping,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Error handling typing indicator:", error);
    }
  }

  private async handleMessageRead(socket: AuthenticatedSocket, data: any) {
    const { messageId } = data;
    if (!socket.userId || !messageId) return;

    try {
      const message = await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date() },
        include: { conversation: true, sender: true },
      });

      const senderSocket = this.connectedUsers.get(message.senderId);
      if (senderSocket) {
        senderSocket.send(
          JSON.stringify({
            type: "message_read",
            data: {
              messageId,
              conversationId: message.conversationId,
              readBy: socket.user?.name,
              readAt: message.readAt,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Error handling message read:", error);
    }
  }

  private async handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.userId) return;
    this.connectedUsers.delete(socket.userId);
    await this.updateUserOnlineStatus(socket.userId, false);
    await this.broadcastOnlineStatus(socket.userId, false);
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline, lastSeen: new Date() },
      });
    } catch (error) {
      console.error("Error updating user online status:", error);
    }
  }

  private async broadcastOnlineStatus(userId: string, isOnline: boolean) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      });

      for (const conversation of conversations) {
        const contactId =
          conversation.user1Id === userId
            ? conversation.user2Id
            : conversation.user1Id;

        const contactSocket = this.connectedUsers.get(contactId);
        if (contactSocket) {
          contactSocket.send(
            JSON.stringify({
              type: "contact_status",
              data: { userId, isOnline, lastSeen: new Date() },
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error broadcasting online status:", error);
    }
  }

  private async sendPushNotification(userId: string, payload: any) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
      });
      const webpush = require("web-push");

      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify(payload),
          );
        } catch (error: any) {
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  async sendToUser(userId: string, message: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
