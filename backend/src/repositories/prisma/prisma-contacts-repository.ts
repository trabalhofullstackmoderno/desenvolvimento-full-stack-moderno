import { Contact, Prisma } from "@prisma/client";
import { ContactsRepository } from "../contacts-repository";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export class PrismaContactsRepository implements ContactsRepository {
	async findById(id: string) {
		const contact = await prisma.contact.findUnique({
			where: {
				id
			}
		})

		return contact
	}

	async create(data: Prisma.ContactCreateInput) {
		const contact = await prisma.contact.create({
			data
		})

		return contact
	}

	async save(data: Contact) {
		const contact = await prisma.contact.update({
			where: {
				id: data.id
			},
			data
		})

		return contact
	}

	async delete(data: Contact) {
		const contact = await prisma.contact.update({
			where: {
				id: data.id
			},
			data
		})

		return contact
	}
}