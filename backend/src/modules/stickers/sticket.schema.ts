import { stickers } from '@database/schema/stickers'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

import { paginationMetaSchema } from '@modules/packs/pack.schema'

export const stickerSchema = createSelectSchema(stickers, {
    id: t.String({
        format: 'uuid',
        description: 'Unique identifier for the sticker',
        examples: [1],
    }),
    name: t.String({
        description: 'Name of the sticker',
        examples: ['Cool Sticker'],
    }),
    objectKey: t.String({
        description: 'Object storage key for the file',
        examples: ['packs/123/stickers/456.webp'],
    }),
    mimeType: t.String({
        description: 'Content-Type of the sticker file',
        examples: ['image/webp', 'video/mp4'],
    }),
    size: t.Number({
        description: 'Sticker file size in bytes',
        examples: [123456],
        minimum: 0,
    }),
    packId: t.String({
        format: 'uuid',
        description: 'ID of the pack this sticker belongs to',
        examples: ['pack_12345'],
    }),
    createdAt: t.Date({
        description: 'Timestamp when the sticker was created',
        examples: ['2024-01-01T00:00:00.000Z'],
    }),
    updatedAt: t.Date({
        description: 'Timestamp when the sticker was last updated',
        examples: ['2024-01-02T00:00:00.000Z'],
    }),
})

export const stickerIdParamSchema = t.Object({
    id: t.String({
        title: 'Sticker ID',
        format: 'uuid',
        description: 'Unique identifier of the sticker',
    }),
})

export const getStickersQuerySchema = t.Object({
    packId: t.String({
        format: 'uuid',
        title: 'Pack ID',
        description: 'Pack to list stickers from',
    }),
    pageNumber: t.Integer({
        title: 'Page number to fetch',
        default: 1,
        minimum: 1,
    }),
    pageSize: t.Integer({
        title: 'Page size',
        default: 25,
        minimum: 1,
        maximum: 100,
    }),
})

export const getStickersResponseSchema = t.Object({
    data: t.Array(stickerSchema),
    meta: paginationMetaSchema,
})

export const createStickerBodySchema = t.Object({
    packId: t.String({
        format: 'uuid',
        title: 'Pack ID',
        description: 'Pack that will own this sticker',
    }),
    name: t.Optional(
        t.String({
            title: 'Sticker name',
            description:
                'Optional sticker name; if omitted the file name will be used',
            minLength: 1,
            maxLength: 100,
        })
    ),
    file: t.File({
        format: 'image/*',
        description: 'Sticker file (image or video)',
    }),
})

export type Sticker = typeof stickerSchema.static
export type StickerIdParam = typeof stickerIdParamSchema.static
export type GetStickersQuery = typeof getStickersQuerySchema.static
export type GetStickersResponse = typeof getStickersResponseSchema.static
export type CreateStickerBody = typeof createStickerBodySchema.static
