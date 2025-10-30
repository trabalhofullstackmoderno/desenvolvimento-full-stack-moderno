import { verifyJWT } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  findUserByEmail,
  getRegisteredContacts,
  searchContacts,
  syncContacts,
} from "./contacts";
import { createConversation, getConversations } from "./conversations";
import { getMessages, markMessageAsRead, sendMessage } from "./messages";

export async function chatRoutes(app: FastifyInstance) {
  const userSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      picture: { type: "string" },
      isOnline: { type: "boolean" },
      lastSeen: { type: "string", format: "date-time" }, // Assumindo que é um Date
    },
  };

  const messageSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      content: { type: "string" },
      senderId: { type: "string" },
      conversationId: { type: "string" },
      isRead: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      // Opcionalmente: sender: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
      // A rota de criação retorna `messages: true`, o que pode ser um array, mas na busca retorna apenas 1
    },
  };

  const conversationSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      user1Id: { type: "string" },
      user2Id: { type: "string" },
      lastMessageAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      user1: userSchema,
      user2: userSchema,
      messages: {
        type: "array",
        items: messageSchema, // Na criação, vem `messages: true` (array completo ou vazio)
      },
    },
  };

  const createConversationSchemas = {
    tags: ["Conversations"],
    body: {
      type: "object",
      required: ["contactEmail"],
      properties: {
        contactEmail: { type: "string", format: "email" },
      },
      additionalProperties: false,
    },
    response: {
      201: {
        // Resposta de Sucesso ao Criar Nova Conversa
        type: "object",
        properties: {
          conversation: conversationSchema,
        },
        required: ["conversation"],
      },
      200: {
        // Resposta de Sucesso ao Retornar Conversa Existente
        type: "object",
        properties: {
          conversation: conversationSchema,
        },
        required: ["conversation"],
      },
      400: {
        // Erro de Validação Zod ou "Cannot create conversation with yourself"
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } }, // Para erros Zod
        },
        required: ["message"],
      },
      404: {
        // "Current user not found" ou "User not found"
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const simpleUserSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      picture: { type: "string" },
      isOnline: { type: "boolean" },
      lastSeen: { type: "string", format: "date-time" },
    },
  };

  const lastMessageResponseSchema = {
    type: ["object", "null"],
    properties: {
      id: { type: "string" },
      content: { type: "string" },
      senderId: { type: "string" },
      senderName: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      isRead: { type: "boolean" },
    },
    required: [
      "id",
      "content",
      "senderId",
      "senderName",
      "createdAt",
      "isRead",
    ],
  };

  const formattedConversationSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      contact: simpleUserSchema,
      lastMessage: lastMessageResponseSchema,
      unreadCount: { type: "number" },
      lastMessageAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
    },
    required: [
      "id",
      "contact",
      "lastMessage",
      "unreadCount",
      "lastMessageAt",
      "createdAt",
    ],
  };

  const getConversationsSchemas = {
    tags: ["Conversations"],
    querystring: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 50, default: 20 },
        offset: { type: "integer", minimum: 0, default: 0 },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          conversations: {
            type: "array",
            items: formattedConversationSchema,
          },
          pagination: {
            type: "object",
            properties: {
              limit: { type: "integer" },
              offset: { type: "integer" },
              hasMore: { type: "boolean" },
            },
            required: ["limit", "offset", "hasMore"],
          },
        },
        required: ["conversations", "pagination"],
      },
      400: {
        // Erro de Validação Zod
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } }, // Para erros Zod
        },
        required: ["message"],
      },
      404: {
        // "Current user not found"
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const senderSchema = {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      picture: { type: ["string", "null"] },
    },
    required: ["id", "name", "picture"],
  };

  const messageResponseSchema = {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      conversationId: { type: "string", format: "uuid" },
      senderId: { type: "string", format: "uuid" },
      content: { type: "string" },
      messageType: {
        type: "string",
        enum: ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE"],
      },
      mediaUrl: { type: ["string", "null"] },
      isRead: { type: "boolean" },
      readAt: { type: ["string", "null"], format: "date-time" },
      isDelivered: { type: "boolean" },
      deliveredAt: { type: ["string", "null"], format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      sender: senderSchema,
    },
    required: [
      "id",
      "conversationId",
      "senderId",
      "content",
      "messageType",
      "isRead",
      "isDelivered",
      "createdAt",
      "sender",
    ],
  };

  const getMessagesSchemas = {
    tags: ["Messages"],
    params: {
      type: "object",
      required: ["conversationId"],
      properties: {
        conversationId: { type: "string", format: "uuid" },
      },
      additionalProperties: false,
    },
    querystring: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
        offset: { type: "integer", minimum: 0, default: 0 },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: messageResponseSchema,
          },
          pagination: {
            type: "object",
            properties: {
              limit: { type: "integer" },
              offset: { type: "integer" },
              hasMore: { type: "boolean" },
            },
            required: ["limit", "offset", "hasMore"],
          },
        },
        required: ["messages", "pagination"],
      },
      400: {
        // Erro de Validação Zod
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } },
        },
        required: ["message"],
      },
      404: {
        // "Current user not found" ou "Conversation not found"
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const sendMessageSchemas = {
    tags: ["Messages"],
    params: {
      type: "object",
      required: ["conversationId"],
      properties: {
        conversationId: { type: "string", format: "uuid" },
      },
      additionalProperties: false,
    },
    body: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string", minLength: 1 },
        messageType: {
          type: "string",
          enum: ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE"],
          default: "TEXT",
        },
        mediaUrl: { type: "string", nullable: true }, // MediaUrl é opcional
      },
      additionalProperties: false,
    },
    response: {
      201: {
        // Resposta de Sucesso (Mensagem Criada)
        type: "object",
        properties: {
          message: messageResponseSchema, // Utiliza o mesmo schema de retorno de mensagem
        },
        required: ["message"],
      },
      400: {
        // Erro de Validação Zod
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } },
        },
        required: ["message"],
      },
      404: {
        // "Current user not found" ou "Conversation not found"
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const markMessageAsReadSchemas = {
    tags: ["Messages"],
    params: {
      type: "object",
      required: ["messageId"],
      properties: {
        messageId: { type: "string", format: "uuid" },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          message: { type: "string", default: "Message marked as read" },
        },
        required: ["message"],
      },
      400: {
        // Erro de Validação Zod
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } },
        },
        required: ["message"],
      },
      404: {
        // "Current user not found" ou "Message not found"
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const syncContactsSchemas = {
    tags: ["Contacts"],
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          message: { type: "string", default: "Contacts synced successfully" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string", default: "Failed to sync contacts" },
        },
        required: ["message"],
      },
    },
  };
  const contactSearchResultSchema = {
    type: "object",
    properties: {
      // A estrutura real de um contato retornado pelo serviço é assumida como a seguinte.
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
      picture: { type: ["string", "null"] },
      isOnline: { type: "boolean" },
      lastSeen: { type: ["string", "null"], format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "name", "email", "isOnline", "lastSeen"], // Adicionei os novos campos obrigatórios
  };
  const searchContactsSchemas = {
    tags: ["Contacts"],
    querystring: {
      type: "object",
      required: ["q"],
      properties: {
        q: { type: "string", minLength: 1 },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          contacts: {
            type: "array",
            items: contactSearchResultSchema,
          },
        },
        required: ["contacts"],
      },
      400: {
        // Erro de Validação Zod (q não fornecido ou vazio)
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const getRegisteredContactsSchemas = {
    tags: ["Contacts"],
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          contacts: {
            type: "array",
            items: contactSearchResultSchema, // Reutilizando o schema de contato
          },
        },
        required: ["contacts"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };

  const foundUserSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
      picture: { type: ["string", "null"] },
      isOnline: { type: "boolean" },
      lastSeen: { type: ["string", "null"], format: "date-time" },
    },
    required: ["id", "name", "email", "picture", "isOnline", "lastSeen"],
  };

  const findUserByEmailSchemas = {
    tags: ["Contacts"],
    querystring: {
      type: "object",
      required: ["email"],
      properties: {
        email: { type: "string", format: "email" },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        // Resposta de Sucesso (Usuário Encontrado)
        type: "object",
        properties: {
          user: foundUserSchema,
          exists: { type: "boolean", const: true },
        },
        required: ["user", "exists"],
      },
      400: {
        // Erro de Validação Zod ou "Cannot add yourself as a contact"
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } }, // Para erros Zod
          exists: { type: "boolean", const: false }, // No caso de "Cannot add yourself"
        },
        required: ["message"],
      },
      404: {
        // "Current user not found" ou "User not found"
        type: "object",
        properties: {
          message: { type: "string" },
          exists: { type: "boolean", const: false },
        },
        required: ["message", "exists"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  };
  // Register protected routes
  app.register(async function (fastify) {
    fastify.addHook("onRequest", verifyJWT);

    // Conversation operations
    fastify.post(
      "/conversations",
      { schema: createConversationSchemas },
      createConversation
    );
    fastify.get(
      "/conversations",
      { schema: getConversationsSchemas },
      getConversations
    );

    // Message operations
    fastify.get(
      "/conversations/:conversationId/messages",
      { schema: getMessagesSchemas },
      getMessages
    );
    fastify.post(
      "/conversations/:conversationId/messages",
      { schema: sendMessageSchemas },
      sendMessage
    );
    fastify.put(
      "/messages/:messageId/read",
      { schema: markMessageAsReadSchemas },
      markMessageAsRead
    );

    // Contact operations
    fastify.post(
      "/contacts/sync",
      { schema: syncContactsSchemas },
      syncContacts
    );
    fastify.get(
      "/contacts/search",
      { schema: searchContactsSchemas },
      searchContacts
    );
    fastify.get(
      "/contacts/registered",
      { schema: getRegisteredContactsSchemas },
      getRegisteredContacts
    );
    fastify.get(
      "/contacts/find-by-email",
      { schema: findUserByEmailSchemas },
      findUserByEmail
    );
  });
}
