import { Contact, Prisma } from "@prisma/client";

export interface ContactsRepository {
  findById(id: string): Promise<Contact | null>
  create(data: Prisma.ContactUncheckedCreateInput): Promise<Contact>
  save(contact: Contact): Promise<Contact>
  delete(contact: Contact): Promise<Contact>
}