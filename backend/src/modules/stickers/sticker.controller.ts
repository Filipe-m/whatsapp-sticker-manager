import { BadRequestException } from '@/exceptions/badRequest'
import { ForbiddenException } from '@/exceptions/forbidden'
import { NotFoundException } from '@/exceptions/notFound'
import { getObjectStorage } from '@lib/storage/storage'
import { authMiddleware } from '@middlewares/auth'
import { PackService } from '@modules/packs/pack.service'
import HttpStatusCode from '@utils/httpStatusCode'
import { emptySchema } from '@utils/schema'
import { Elysia, status, t } from 'elysia'
import { StickerService } from './sticker.service'
import {
    createStickerBodySchema,
    getStickersQuerySchema,
    getStickersResponseSchema,
    stickerIdParamSchema,
    stickerSchema,
} from './sticket.schema'

export const sticker = new Elysia({
    prefix: '/sticker',
    detail: { tags: ['Sticker'] },
})
    .use(authMiddleware)
    .get(
        '',
        async ({ user, query }) => {
            const result = await StickerService.getStickers({
                userId: user.id,
                packId: query.packId,
                pageNumber: query.pageNumber,
                pageSize: query.pageSize,
                search: query.search,
            })

            return status(HttpStatusCode.OK_200, result)
        },
        {
            auth: true,
            detail: {
                summary: 'List stickers in a pack',
                description:
                    'Returns stickers for the given pack with pagination',
            },
            query: getStickersQuerySchema,
            response: {
                200: getStickersResponseSchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .get(
        ':id',
        async ({ params, user }) => {
            const sticker = await StickerService.getStickerById(params.id)
            if (!sticker) {
                throw new NotFoundException(
                    `Sticker with ID ${params.id} not found`
                )
            }

            await PackService.assertUserHasPermission(user.id, sticker.packId, [
                'view',
            ])

            return status(HttpStatusCode.OK_200, sticker)
        },
        {
            auth: true,
            detail: {
                summary: 'Get sticker metadata',
                description: 'Get sticker DB record (metadata)',
            },
            params: stickerIdParamSchema,
            response: {
                200: stickerSchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .get(
        ':id/file',
        async ({ params, user }) => {
            const sticker = await StickerService.getStickerById(params.id)
            if (!sticker) {
                throw new NotFoundException(
                    `Sticker with ID ${params.id} not found`
                )
            }

            await PackService.assertUserHasPermission(user.id, sticker.packId, [
                'view',
            ])

            const storage = getObjectStorage()
            const webStream = await storage.getObjectStream(sticker.objectKey)

            return new Response(webStream, {
                status: HttpStatusCode.OK_200,
                headers: {
                    'Content-Type': sticker.mimeType,
                    'Content-Length': String(sticker.size),
                    'Cache-Control': 'private, max-age=0, must-revalidate',
                },
            })
        },
        {
            auth: true,
            detail: {
                summary: 'Download sticker file',
                description:
                    'Streams the sticker file (image/video) from object storage',
            },
            params: stickerIdParamSchema,
            response: {
                200: t.Any(),
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .post(
        '',
        async ({ body, user }) => {
            const created = await StickerService.createSticker({
                userId: user.id,
                packId: body.packId,
                file: body.file,
                name: body.name,
            })

            return status(HttpStatusCode.CREATED_201, created)
        },
        {
            auth: true,
            detail: {
                summary: 'Create sticker',
                description: 'Create a new sticker inside a pack',
            },
            body: createStickerBodySchema,
            response: {
                201: stickerSchema,
                400: BadRequestException.schema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
    .delete(
        ':id',
        async ({ params, user }) => {
            await StickerService.deleteSticker(user.id, params.id)
            return status(HttpStatusCode.NO_CONTENT_204)
        },
        {
            auth: true,
            detail: {
                summary: 'Delete a sticker',
                description: 'Deletes the sticker record and its stored file',
            },
            params: stickerIdParamSchema,
            response: {
                204: emptySchema,
                403: ForbiddenException.schema,
                404: NotFoundException.schema,
            },
        }
    )
