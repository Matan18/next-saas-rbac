import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { NotFoundError } from "../_errors/not-found-error";

export function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:orgSlug/projects/:projectSlug",
      {
        schema: {
          tags: ["projects"],
          summary: "Get organization project",
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            200: z.object({
              project: z.object({
                id: z.string().uuid(),
                description: z.string(),
                name: z.string(),
                slug: z.string(),
                avatarUrl: z.string().nullable(),
                organizationId: z.string(),
                ownerId: z.string(),
                owner: z.object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params;

        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(orgSlug);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot("get", "Project")) {
          throw new UnauthorizedError("You're not allowed to see this project");
        }

        const project = await prisma.project.findUnique({
          where: { slug: projectSlug, organizationId: organization.id },
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        if (!project) {
          throw new NotFoundError("Project not found");
        }

        return reply.send({ project });
      }
    );
}
