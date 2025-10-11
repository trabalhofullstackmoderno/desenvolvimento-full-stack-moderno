import { FastifyInstance } from "fastify"
// import { index } from "./index"
// import { show } from "./show"
import { create } from "./create"
// import { update } from "./update"
// import { delete } from "./delete"

export async function contactsRoutes(app: FastifyInstance) {
  // app.get("/contacts", index)
  // app.get("/contacts/:contactId", show)
  app.post("/contacts", create)
  // app.put("/contacts", update)
  // app.delete("/contacts", delete)
}