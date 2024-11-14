import type { FastifyInstance } from "fastify";
import { auth } from "../middlewares/auth";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { roleSchema } from "@saas/auth";

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/membership",
      {
        schema: {
          tags: ["organizations"],
          summary: "Get user membership on organization",
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              membership: z.object({
                id: z.string().uuid(),
                role: roleSchema,
                organizationId: z.string().uuid(),
              }),
            }),
          },
        },
      },
      async (request) => {
        const { slug } = request.params;
        const {
          membership: { id, role, organizationId },
        } = await request.getUserMembership(slug);

        return { membership: { id, role, organizationId } };
      }
    );
}
