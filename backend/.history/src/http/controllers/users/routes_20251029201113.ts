import { FastifyInstance } from "fastify"
import { authenticate } from "./authenticate"
import { logout } from "./logout"
import { getMe } from "./me"
import { verifyJWT } from "@/middlewares/verify-jwt"

export async function usersRoutes(app: FastifyInstance) {
  // OAuth callback is now registered directly in app.ts

  // Protected routes
  app.register(async function (fastify) {
    app.addHook('onRequest', verifyJWT)

    fastify.get("/me", getMe)
    fastify.get("/logout", logout)
  })
}