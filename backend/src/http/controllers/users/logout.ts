import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function logout(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    reply.clearCookie("refreshToken", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return reply.status(200).send({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno", error });
  }
}
