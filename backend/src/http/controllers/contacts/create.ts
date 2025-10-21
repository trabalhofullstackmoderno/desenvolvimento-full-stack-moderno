import { z } from "zod";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateContactService } from "@/services/factories/make-create-contact-service";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createContactBodySchema = z.object({
    email: z.string(),
    nickname: z.string(),
  });

  const { email, nickname } = createContactBodySchema.parse(request.body);

  const createService = makeCreateContactService();

  await createService.execute({
    email,
    nickname,
  });

  return reply.status(201).send();
}
