import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { organizationSchema } from "@saas/auth";
import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { getUserPermissions } from "@/utils/get-user-permissions";

export function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug",
      {
        schema: {
          tags: ["organizations"],
          summary: "Update organization",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttatchUsersByDomain: z.boolean().optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const { slug } = request.params;
        const { organization, membership } =
          await request.getUserMembership(slug);
        const { name, domain, shouldAttatchUsersByDomain } = request.body;

        const authOrganization = organizationSchema.parse(organization);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot("update", authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to update this organization"
          );
        }

        if (domain) {
          const organizationWithDomain = await prisma.organization.findFirst({
            where: { domain, id: { not: organization.id } },
          });

          if (organizationWithDomain) {
            throw new BadRequestError("Domain is already taken");
          }
        }

        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            name,
            domain,
            shouldAttatchUsersByDomain,
          },
        });

        return reply.status(204).send();
      }
    );
}
