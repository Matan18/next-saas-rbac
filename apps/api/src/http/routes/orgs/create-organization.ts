import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { createSlug } from "@/utils/create-slug";

export function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations",
      {
        schema: {
          tags: ["organizations"],
          summary: "Create new organization",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttatchUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              organizationId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const { name, domain, shouldAttatchUsersByDomain } = request.body;

        if (domain) {
          const organizationByDomain = await prisma.organization.findUnique({
            where: { domain },
          });

          if (organizationByDomain) {
            throw new BadRequestError(
              "Another organization with the same domain already exists"
            );
          }
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            domain,
            slug: createSlug(name),
            shouldAttatchUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: "ADMIN",
              },
            },
          },
        });

        return reply.status(201).send({ organizationId: organization.id });
      }
    );
}
