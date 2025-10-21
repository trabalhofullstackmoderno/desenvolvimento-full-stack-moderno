import { FastifyInstance } from "fastify"
import { authenticate } from "./authenticate"
import { logout } from "./logout"
import { getMe } from "./me"

export async function usersRoutes(app: FastifyInstance) {
  // Public routes
  app.get("/login/google/callback", async (request, reply) => {
    return authenticate(app, request, reply)
  })

  // Protected routes
  app.register(async function (fastify) {
    fastify.addHook('onRequest', fastify.authenticate)

    fastify.get("/me", getMe)
    fastify.get("/logout", logout)
  })
}