import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { roleSchema } from "@saas/auth";
import { BadRequestError } from "../_errors/bad-request-error";

export function getInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/invites/:inviteId",
      {
        schema: {
          tags: ["invites"],
          summary: "Get an invite",
          params: z.object({
            inviteId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              invite: z.object({
                organization: z
                  .object({
                    name: z.string(),
                  })
                  .nullable(),
                id: z.string(),
                createdAt: z.date(),
                role: roleSchema,
                email: z.string(),
                author: z
                  .object({
                    id: z.string(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  })
                  .nullable(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { inviteId } = request.params;

        const invite = await prisma.invite.findUnique({
          where: { id: inviteId },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!invite) {
          throw new BadRequestError("Invite not found");
        }

        return { invite };
      }
    );
}
