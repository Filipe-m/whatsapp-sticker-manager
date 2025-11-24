import { packs } from '@database/schema/packs'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export const emptySchema = t.Any()

export const packSchema = createSelectSchema(packs, {
    id: t.Number({
        description: 'Unique identifier for the pack',
        examples: [1],
    }),
    name: t.String({
        description: 'Name of the pack',
        examples: ['Funny Stickers'],
    }),
    owner: t.String({
        description: 'ID of the user who owns the pack',
        examples: 42,
    }),
    public: t.Boolean({
        description: 'Indicates if the pack is public (everyone can acess)',
        examples: true,
    }),
    createdAt: t.Date({
        description: 'Timestamp when the pack was created',
        examples: ['2024-01-01T00:00:00.000Z'],
    }),
    updatedAt: t.Date({
        description: 'Timestamp when the pack was last updated',
        examples: ['2024-01-02T00:00:00.000Z'],
    }),
})

export const getPacksResponseSchema = t.Object({
    data: t.Array(packSchema),
    meta: t.Object({
        page: t.Number({
            description: 'Current page number',
            examples: [1],
        }),
        pageSize: t.Number({
            description: 'Number of items per page',
            examples: [10],
        }),
        total: t.Number({
            description: 'Total number of items available',
            examples: [100],
        }),
        totalPages: t.Number({
            description: 'Total number of pages available',
            examples: [10],
        }),
    }),
})

export type GetPackReponse = typeof getPacksResponseSchema.static

export const getPacksQuerySchema = t.Object({
    pageNumber: t.Number({
        title: 'Page which is being fetched',
        default: 1,
        example: 1,
    }),
    pageSize: t.Number({
        title: 'Size of the page consulted',
        default: 10,
        example: 10,
    }),
})

export const createPackBodySchema = t.Object({
    name: t.String({ title: 'Name of the pack' }),
    public: t.Boolean({
        title: 'Is the pack public?',
        default: false,
    }),
})

export const updatePackParamSchema = t.Object({
    id: t.Number({
        title: 'ID of the pack to be updated',
        examples: [1],
    }),
})
