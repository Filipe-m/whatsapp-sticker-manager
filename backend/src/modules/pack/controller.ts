import { authMiddleware } from '@middlewares/auth'
import { Elysia, status } from 'elysia'
import {
    createPackBodySchema,
    emptySchema,
    getPacksQuerySchema,
    getPacksResponseSchema,
    packSchema,
    updatePackParamSchema,
} from './model'
import { PackService } from './service'

export const pack = new Elysia({
    prefix: '/pack',
    detail: { tags: ['Pack'] },
})
    .use(authMiddleware)
    .get(
        '',
        async ({ user, query }) => {
            const packs = PackService.getPacks(
                user.id,
                query.pageNumber,
                query.pageSize
            )
            return packs
        },
        {
            auth: true,
            detail: {
                summary: 'Get packs',
                description:
                    'Get the packs avaiable to the user with pagination',
            },
            query: getPacksQuerySchema,
            response: {
                200: getPacksResponseSchema,
            },
        }
    )
    .post(
        '',
        async ({ user, body }) => {
            const pack = await PackService.createPack({
                name: body.name,
                owner: user.id,
                public: body.public,
            })

            console.log(pack)
            return status(201, pack)
        },
        {
            auth: true,
            detail: {
                summary: 'Create a pack',
                description: 'Create a new pack of sticker',
            },
            body: createPackBodySchema,
            response: {
                201: packSchema,
            },
        }
    )
    .put(
        ':id',
        async ({ user, params }) => {
            const hasPermission = await PackService.hasPermission(
                user.id,
                params.id,
                ['edit']
            )
            if (!hasPermission) {
                return status(403)
            }
        },
        {
            auth: true,
            detail: {
                summary: 'Update a pack',
                description: 'Update the details of an existing pack',
            },
            params: updatePackParamSchema,
            body: createPackBodySchema,
            response: {
                200: packSchema,
                403: emptySchema,
            },
        }
    )
