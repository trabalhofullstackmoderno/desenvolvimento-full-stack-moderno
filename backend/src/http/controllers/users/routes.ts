import { FastifyInstance } from "fastify"
import { authenticate } from "./authenticate"

export async function usersRoutes(app: FastifyInstance) {
  app.get("/login/google/callback", async (request, reply) => {
    return authenticate(app, request, reply)
  })
}