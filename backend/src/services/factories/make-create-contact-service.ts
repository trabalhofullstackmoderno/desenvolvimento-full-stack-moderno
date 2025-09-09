import { CreateContactService } from "../create-contact"
import { PrismaContactsRepository } from "@/repositories/prisma/prisma-contacts-repository"

export function makeCreateContactService() {
  const contactsRepository = new PrismaContactsRepository()
  const service = new CreateContactService(contactsRepository)

  return service
}