import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { roleSchema } from "@saas/auth";

export function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/organizations/:orgSlug/members/:memberId",
      {
        schema: {
          tags: ["members"],
          summary: "Update a member",
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            memberId: z.string().uuid(),
          }),
          body: z.object({
            role: roleSchema,
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug } = request.params;

        const userId = await request.getCurrentUserId();
        const { membership, organization } =
          await request.getUserMembership(orgSlug);

        const { cannot } = getUserPermissions(userId, membership.role);

        if (cannot("update", "User")) {
          throw new UnauthorizedError(
            "You're not allowed to update this member"
          );
        }

        const { role } = request.body;

        await prisma.member.update({
          where: {
            id: request.params.memberId,
            organizationId: organization.id,
          },
          data: {
            role,
          },
        });

        return reply.status(204).send();
      }
    );
}
