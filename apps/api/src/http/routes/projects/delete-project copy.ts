import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { projectSchema } from "@saas/auth";
import { NotFoundError } from "../_errors/not-found-error";

export function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/organizations/:slug/projects/:projectId",
      {
        schema: {
          tags: ["projects"],
          summary: "Update a project",
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().min(1),
            description: z.string(),
          }),
          params: z.object({
            slug: z.string(),
            projectId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params;

        const userId = await request.getCurrentUserId();
        const { organization, membership } =
          await request.getUserMembership(slug);

        const { cannot } = getUserPermissions(userId, membership.role);

        const project = await prisma.project.findUnique({
          where: { id: projectId, organizationId: organization.id },
        });

        if (!project) {
          throw new NotFoundError("Project not found");
        }

        const authProject = projectSchema.parse(project);

        if (cannot("update", authProject)) {
          throw new UnauthorizedError(
            "You're not allowed to update this project"
          );
        }

        const { name, description } = request.body;

        await prisma.project.update({
          where: { id: projectId, organizationId: organization.id },
          data: { name, description },
        });

        return reply.status(204).send();
      }
    );
}
