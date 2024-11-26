import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { auth } from "../middlewares/auth";
import z from "zod";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export function removeMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
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

        if (cannot("delete", "User")) {
          throw new UnauthorizedError(
            "You're not allowed to remove this member from organization"
          );
        }

        await prisma.member.delete({
          where: {
            id: request.params.memberId,
            organizationId: organization.id,
          },
        });

        return reply.status(204).send();
      }
    );
}
