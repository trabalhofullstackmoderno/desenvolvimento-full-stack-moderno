import { FastifyInstance } from "fastify"
import { authenticate } from "./authenticate"
import { logout } from "./logout"
import { getMe } from "./me"
import { verifyJWT } from "@/middlewares/verify-jwt"

export async function usersRoutes(app: FastifyInstance) {
  // Public routes
  app.get("/login/google/callback", async (request, reply) => {
    return authenticate(app, request, reply)
  })

  // Protected routes
  app.register(async function (fastify) {
    app.addHook('onRequest', verifyJWT)

    fastify.get("/me", getMe)
    fastify.get("/logout", logout)
  })
}