import { prisma } from "@/lib/prisma";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { BadRequestError } from "../_errors/bad-request-error";
import { auth } from "../middlewares/auth";

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/profile",
      {
        schema: {
          tags: ["auth"],
          summary: "Get authenticated user profile",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              user: z.object({
                id: z.string(),
                name: z.string().nullable(),
                email: z.string(),
                avatarUrl: z.string().url().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        });

        if (!user) {
          throw new BadRequestError("User not found");
        }

        return reply.send({ user });
      }
    );
}
