import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { roleSchema } from "@saas/auth";

export function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations",
      {
        schema: {
          tags: ["organizations"],
          summary: "Get organization where user is member",
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              organizations: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  slug: z.string(),
                  role: roleSchema,
                  avatarUrl: z.string().nullable(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const organizations = await prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            members: {
              select: { role: true },
              where: { userId },
            },
          },
          where: { members: { some: { userId } } },
        });

        const organizationsWithUserRole = organizations.map(
          ({ members, ...org }) => ({
            ...org,
            role: members[0].role,
          })
        );

        return { organizations: organizationsWithUserRole };
      }
    );
}
