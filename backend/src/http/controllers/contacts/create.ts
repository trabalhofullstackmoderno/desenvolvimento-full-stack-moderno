import { z } from "zod";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateContactService } from "@/services/factories/make-create-contact-service";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createContactBodySchema = z.object({
    name: z.string(),
    phoneNumber: z.string().optional(),
  });

  const { name, phoneNumber } = createContactBodySchema.parse(request.body);

  const createService = makeCreateContactService();

  await createService.execute({
    name,
    phoneNumber,
    userId: request.user.sub,
  });

  return reply.status(201).send();
}
