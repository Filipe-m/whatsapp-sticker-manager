import { ForbiddenException } from '@/exceptions/forbidden'
import { NotFoundException } from '@/exceptions/notFound'
import { authMiddleware } from '@middlewares/auth'
import { getUsersResponseSchema } from '@modules/users/user.schema'
import HttpStatusCode from '@utils/httpStatusCode'
import { Elysia, status } from 'elysia'
import { getUsersQuerySchema } from './user.schema'
import { UserService } from './user.service'

export const user = new Elysia({
    prefix: '/user',
    detail: { tags: ['User'] },
})
    .use(authMiddleware)
    .get(
        '',
        async ({ query, user }) => {
            const result = await UserService.getUsers({
                pageNumber: query.pageNumber,
                pageSize: query.pageSize,
                search: query.search,
                excludeUserId: user.id,
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
                description: 'Returns users with pagination',
            },
            query: getUsersQuerySchema,
            response: {
                200: getUsersResponseSchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
