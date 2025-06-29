import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'
import { auth } from '../middlewares/auth'

export function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  id: z.string().uuid(),
                  userId: z.string().uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  avatarUrl: z.string().url().nullable(),
                  email: z.string().email(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership } = await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User')) {
          throw new UnauthorizedError(
            "You're not allowed to see this organization members",
          )
        }

        const members = await prisma.member.findMany({
          where: { organization: { slug: orgSlug } },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        })

        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => ({
            ...user,
            ...member,
            userId,
          }),
        )

        return reply.send({ members: membersWithRoles })
      },
    )
}
