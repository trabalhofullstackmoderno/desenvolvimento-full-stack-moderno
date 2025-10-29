import { Contact } from "@prisma/client";
import { ContactsRepository } from "@/repositories/contacts-repository";

interface CreateContactServiceRequest {
  name: string,
  phoneNumber?: string,
  userId: string
}

interface CreateContactServiceResponse {
  contact: Contact
}

export class CreateContactService {
  constructor(private contactsRepository: ContactsRepository) { }

  async execute({ name, phoneNumber, userId }: CreateContactServiceRequest): Promise<CreateContactServiceResponse> {
    const contact = await this.contactsRepository.create({
      name,
      phoneNumber,
      user: { connect: { id: userId } }
    })

    return { contact };
  }
}