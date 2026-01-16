import { BadRequestException } from '@/exceptions/badRequest'
import { ForbiddenException } from '@/exceptions/forbidden'
import { NotFoundException } from '@/exceptions/notFound'
import { getObjectStorage } from '@lib/storage/storage'
import { authMiddleware } from '@middlewares/auth'
import { PackService } from '@modules/packs/pack.service'
import HttpStatusCode from '@utils/httpStatusCode'
import { emptySchema } from '@utils/schema'
import { Elysia, status, t } from 'elysia'
import { UserService } from './user.service'
import {
    getUsersQuerySchema,
} from './user.schema'
import { getUsersResponseSchema } from '@modules/users/user.schema'

export const user = new Elysia({
    prefix: '/user',
    detail: { tags: ['User'] },
})
    .use(authMiddleware)
    .get(
        '',
        async ({ query }) => {
            const result = await UserService.getUsers({
                pageNumber: query.pageNumber,
                pageSize: query.pageSize,
            })

            return status(HttpStatusCode.OK_200, {
                data: result.data.map((user) => ({
                    ...user,
                    image: user.image || null,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                })),
                meta: result.meta,
            })
        },
        {
            auth: true,
            detail: {
                summary: 'List users with pagination',
                description:
                    'Returns users with pagination',
            },
            query: getUsersQuerySchema,
            response: {
                200: getUsersResponseSchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
