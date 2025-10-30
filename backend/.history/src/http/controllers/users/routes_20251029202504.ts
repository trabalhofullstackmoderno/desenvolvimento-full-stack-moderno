import { verifyJWT } from "@/middlewares/verify-jwt"
import { FastifyInstance } from "fastify"
import { logout } from "./logout"
import { getMe } from "./me"

export async function usersRoutes(app: FastifyInstance) {
  // OAuth callback is now registered directly in app.ts
  const userMeResponseSchema = {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" }, // Assumindo UUID para o ID interno
      googleId: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: "string" },
      picture: { type: ["string", "null"] },
      isOnline: { type: "boolean" },
      lastSeen: { type: ["string", "null"], format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
    },
    required: [
      "id",
      "googleId",
      "email",
      "name",
      "isOnline",
      "lastSeen",
      "createdAt",
    ],
  };

  const getMeSchemas = {
    tags: ["User"],
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          user: userMeResponseSchema,
        },
        required: ["user"],
      },
      404: {
        // "User not found"
        type: "object",
        properties: {
          message: { type: "string", default: "User not found" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno
        type: "object",
        properties: {
          message: { type: "string", default: "Internal server error" },
        },
        required: ["message"],
      },
    },
  };

  const logoutSchemas = {
    tags: ["User"],
    response: {
      200: {
        // Resposta de Sucesso
        type: "object",
        properties: {
          message: { type: "string", default: "Logout realizado com sucesso" },
        },
        required: ["message"],
      },
      500: {
        // Erro interno (embora improvável neste bloco try/catch)
        type: "object",
        properties: {
          message: { type: "string", default: "Erro interno" },
          error: { type: "object" }, // O erro real é incluído aqui
        },
        required: ["message", "error"],
      },
    },
  };

  const googleCallbackSchemas = {
    tags: ["User"],
    // Não há 'querystring' ou 'params' definidos explicitamente aqui
    // porque são tratados internamente pelo plugin OAuth2

    response: {
      302: {
        // Redirecionamento de Sucesso (para http://localhost:3000?token=...)
        description:
          "Successful authentication, setting JWT cookies and redirecting to the frontend.",
        type: "null", // O Fastify espera 'null' para respostas sem corpo (como redirecionamentos)
      },
      500: {
        // Erro interno (falha na autenticação, erro Prisma, ou erro de token)
        type: "object",
        properties: {
          message: { type: "string", default: "Erro interno" },
          error: { type: "object" }, // Inclui o objeto de erro para debug
        },
        required: ["message", "error"],
      },
    },
  };


  // Protected routes
  app.register(async function (fastify) {
    app.addHook('onRequest', verifyJWT)

    fastify.get("/me", {schema:getMeSchemas} ,getMe)
    fastify.get("/logout", {schema:logoutSchemas},logout)
  })
}