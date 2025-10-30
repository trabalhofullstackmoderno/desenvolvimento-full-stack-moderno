import { verifyJWT } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { getVapidPublicKey, subscribePush, unsubscribePush } from "./subscribe";

export async function pushRoutes(app: FastifyInstance) {
  
  const getVapidPublicKeySchemas = {
    tags: ["Subscribe"],
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          publicKey: { type: "string" }, // A chave pública VAPID (string Base64 urlsafe)
        },
        required: ["publicKey"],
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
  // Public route for VAPID key
  app.get("/push/vapid-public-key", {schema:getVapidPublicKeySchemas},getVapidPublicKey);

  const subscribePushSchemas = {
    tags: ["Subscribe"],
    body: {
      type: "object",
      required: ["endpoint", "keys"],
      properties: {
        endpoint: { type: "string", format: "url" },
        keys: {
          type: "object",
          required: ["p256dh", "auth"],
          properties: {
            p256dh: { type: "string" },
            auth: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    response: {
      201: {
        // Resposta de Sucesso (Subscrição criada)
        type: "object",
        properties: {
          message: {
            type: "string",
            default: "Push subscription created successfully",
          },
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

  const unsubscribePushSchemas = {
    tags: ["Subscribe"],
    body: {
      type: "object",
      required: ["endpoint"],
      properties: {
        endpoint: { type: "string", format: "url" },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          message: {
            type: "string",
            default: "Push subscription removed successfully",
          },
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

  // Protected routes
  app.register(async function (fastify) {
    fastify.addHook("onRequest", verifyJWT);
    fastify.post("/push/subscribe", {schema: subscribePushSchemas},subscribePush);
    fastify.delete("/push/unsubscribe", {schema:unsubscribePushSchemas},unsubscribePush);
  });
}
