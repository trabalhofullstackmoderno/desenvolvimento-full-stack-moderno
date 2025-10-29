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
