import { FastifyInstance } from "fastify"
import { authenticate } from "./authenticate"
import { logout } from "./logout"

export async function usersRoutes(app: FastifyInstance) {
  app.get("/login/google/callback", async (request, reply) => {
    return authenticate(app, request, reply)
  })

  app.get("/logout", async (request, reply) => {
    return logout(app, request, reply)
  })
}