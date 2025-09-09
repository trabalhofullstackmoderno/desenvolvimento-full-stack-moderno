import { Contact } from "@prisma/client";
import { ContactsRepository } from "@/repositories/contacts-repository";

interface CreateContactServiceRequest {
  nickname: string,
  user_id: string
}

interface CreateContactServiceResponse {
  contact: Contact
}

export class CreateContactService {
  constructor(private contactsRepository: ContactsRepository) { }

  async execute({ nickname, user_id }: CreateContactServiceRequest): Promise<CreateContactServiceResponse> {
    const contact = await this.contactsRepository.create({
      nickname,
      user_id,
    })

    return { contact };
  }
}