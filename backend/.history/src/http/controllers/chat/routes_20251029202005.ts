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
      
      createConversation
    );
    fastify.get(
      "/conversations",
      
      getConversations
    );

    // Message operations
    fastify.get(
      "/conversations/:conversationId/messages",
      
      getMessages
    );
    fastify.post(
      "/conversations/:conversationId/messages",
      
      sendMessage
    );
    fastify.put(
      "/messages/:messageId/read",
      
      markMessageAsRead
    );

    // Contact operations
    fastify.post(
      "/contacts/sync",
      
      syncContacts
    );
    fastify.get(
      "/contacts/search",
      
      searchContacts
    );
    fastify.get(
      "/contacts/registered",
      
      getRegisteredContacts
    );
    fastify.get(
      "/contacts/find-by-email",
      
      findUserByEmail
    );
  });
}
