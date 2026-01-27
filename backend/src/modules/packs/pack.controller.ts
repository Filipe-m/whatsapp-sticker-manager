import { ForbiddenException } from '@/exceptions/forbidden'
import { NotFoundException } from '@/exceptions/notFound'
import { authMiddleware } from '@middlewares/auth'
import HttpStatusCode from '@utils/httpStatusCode'
import { emptySchema } from '@utils/schema'
import { Elysia, status, t } from 'elysia'
import {
    createPackBodySchema,
    getPacksQuerySchema,
    getPacksResponseSchema,
    packIdParamSchema,
    packSchema,
    sharePackBodySchema,
    unsharePackParamSchema,
    updatePackBodySchema,
} from './pack.schema'
import { PackService } from './pack.service'

export const pack = new Elysia({
    prefix: '/pack',
    detail: { tags: ['Pack'] },
})
    .use(authMiddleware)
    .get(
        '',
        async ({ user, query }) => {
            const packs = await PackService.getPacks(
                user.id,
                query.pageNumber,
                query.pageSize,
                {
                    owned: query.owned,
                    public: query.public,
                    shared: query.shared,
                    search: query.search,
                }
            )
            return packs
        },
        {
            auth: true,
            detail: {
                summary: 'Get packs',
                description:
                    'Get the packs available to the user with pagination. Use owned, public, and shared flags to filter results. If no flags are provided, returns all packs (owned, shared, and public).',
            },
            query: getPacksQuerySchema,
            response: {
                200: getPacksResponseSchema,
            },
        }
    )
    .get(
        ':id',
        async ({ params, user }) => {
            await PackService.assertUserHasPermission(user.id, params.id, [
                'view',
            ])
            const pack = await PackService.getPackByID(params.id)

            if (!pack) {
                throw new NotFoundException(
                    `Pack with ID ${params.id} not found`
                )
            }

            return status(200, pack)
        },
        {
            auth: true,
            detail: {
                summary: 'Get a pack',
                description: 'Get a specific pack by ID',
            },
            params: packIdParamSchema,
            response: {
                200: packSchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .post(
        '',
        async ({ user, body }) => {
            const pack = await PackService.createPack({
                name: body.name.trim(),
                owner: user.id,
                public: body.public,
            })

            return status(201, pack)
        },
        {
            auth: true,
            detail: {
                summary: 'Create a pack',
                description: 'Create a new pack of stickers',
            },
            body: createPackBodySchema,
            response: {
                201: packSchema,
            },
        }
    )
    .put(
        ':id',
        async ({ user, params, body }) => {
            await PackService.assertUserHasPermission(user.id, params.id, [
                'edit',
            ])
            const updatedPack = await PackService.updatePack(params.id, body)
            return updatedPack
        },
        {
            auth: true,
            detail: {
                summary: 'Update a pack',
                description:
                    'Update the details of an existing pack (partial update supported)',
            },
            params: packIdParamSchema,
            body: updatePackBodySchema,
            response: {
                200: packSchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .delete(
        ':id',
        async ({ user, params }) => {
            await PackService.assertUserHasPermission(user.id, params.id, [
                'delete',
            ])
            await PackService.deletePack(params.id)
            return status(HttpStatusCode.NO_CONTENT_204)
        },
        {
            auth: true,
            detail: {
                summary: 'Delete a pack',
                description: 'Delete an existing pack permanently',
            },
            params: packIdParamSchema,
            response: {
                204: emptySchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .post(
        ':id/share',
        async ({ user, params, body }) => {
            await PackService.assertUserHasPermission(user.id, params.id, [
                'edit',
            ])
            const sharedPack = await PackService.sharePack(
                params.id,
                body.userId,
                {
                    canEdit: body.canEdit,
                    canDelete: body.canDelete,
                }
            )
            return status(201, sharedPack)
        },
        {
            auth: true,
            detail: {
                summary: 'Share a pack with a user',
                description:
                    'Share a pack with another user and set their permissions (edit, delete)',
            },
            params: packIdParamSchema,
            body: sharePackBodySchema,
            response: {
                201: t.Any(),
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .delete(
        ':id/share/:userId',
        async ({ user, params }) => {
            await PackService.assertUserHasPermission(user.id, params.id, [
                'edit',
            ])
            await PackService.unsharePack(params.id, params.userId)
            return status(HttpStatusCode.NO_CONTENT_204)
        },
        {
            auth: true,
            detail: {
                summary: 'Remove pack sharing',
                description:
                    'Remove sharing permissions from a user for this pack',
            },
            params: unsharePackParamSchema,
            response: {
                204: emptySchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
