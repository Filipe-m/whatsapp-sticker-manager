import { packs } from '@database/schema/packs'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

const ownerUserSchema = t.Object({
    id: t.String({ format: 'uuid', description: 'User ID' }),
    name: t.String({ description: 'User name' }),
    email: t.String({ format: 'email', description: 'User email' }),
})

export const packSchema = t.Object({
    id: t.String({
        format: 'uuid',
        description: 'Unique identifier for the pack',
        examples: [1],
        minimum: 1,
    }),
    name: t.String({
        description: 'Name of the pack',
        examples: ['Funny Stickers', 'Work Reactions', 'Memes'],
        minLength: 1,
        maxLength: 100,
    }),
    owner: t.String({
        description: 'ID of the user who owns the pack',
        examples: ['user-123', 'auth0|507f1f77bcf86cd799439011'],
    }),
    public: t.Boolean({
        description: 'Indicates if the pack is public (everyone can access)',
        examples: [true, false],
        default: false,
    }),
    createdAt: t.Date({
        description: 'Timestamp when the pack was created (ISO 8601 format)',
        examples: ['2024-01-01T00:00:00.000Z'],
    }),
    updatedAt: t.Date({
        description:
            'Timestamp when the pack was last updated (ISO 8601 format)',
        examples: ['2024-01-02T12:30:00.000Z'],
    }),
    ownerUser: t.Optional(ownerUserSchema),
    sharedPacks: t.Optional(t.Array(t.Any())),
})

const packNameSchema = t.String({
    title: 'Name of the pack',
    description: 'Pack name must be between 1 and 100 characters',
    minLength: 1,
    maxLength: 100,
    examples: ['Funny Stickers', 'Work Reactions'],
})

const packPublicSchema = t.Boolean({
    title: 'Is the pack public?',
    description:
        'Public packs can be accessed by anyone, private packs are restricted to owner and shared users',
    default: false,
    examples: [true, false],
})

export const paginationMetaSchema = t.Object({
    page: t.Integer({
        description: 'Current page number',
        examples: [1],
        minimum: 1,
    }),
    pageSize: t.Integer({
        description: 'Number of items per page',
        examples: [10, 25, 50],
        minimum: 1,
        maximum: 100,
    }),
    total: t.Integer({
        description: 'Total number of items available',
        examples: [100, 0, 1523],
        minimum: 0,
    }),
    totalPages: t.Integer({
        description: 'Total number of pages available',
        examples: [10, 0, 61],
        minimum: 0,
    }),
})

export const getPacksQuerySchema = t.Object({
    pageNumber: t.Integer({
        title: 'Page number to fetch',
        description: 'Page number for pagination, starting from 1',
        default: 1,
        minimum: 1,
        examples: [1, 2, 10],
    }),
    pageSize: t.Integer({
        title: 'Page size',
        description: 'Number of items per page (max 100)',
        default: 10,
        minimum: 1,
        maximum: 100,
        examples: [10, 25, 50, 100],
    }),
    owned: t.Optional(
        t.Boolean({
            title: 'Filter owned packs',
            description:
                'If true, returns only packs owned by the authenticated user. Can be combined with other filters.',
            examples: [true, false],
        })
    ),
    public: t.Optional(
        t.Boolean({
            title: 'Filter public packs',
            description:
                'If true, returns only public packs. Can be combined with other filters.',
            examples: [true, false],
        })
    ),
    shared: t.Optional(
        t.Boolean({
            title: 'Filter shared packs',
            description:
                'If true, returns only packs shared with the authenticated user. Can be combined with other filters.',
            examples: [true, false],
        })
    ),
    search: t.Optional(
        t.String({
            title: 'Search packs by name',
            description:
                'Search for packs by name using partial matching (case-insensitive).',
            minLength: 1,
            maxLength: 100,
            examples: ['funny', 'work', 'memes'],
        })
    ),
})

export const createPackBodySchema = t.Object(
    {
        name: packNameSchema,
        public: packPublicSchema,
    },
    {
        description: 'Schema for creating a new pack',
        examples: [
            {
                name: 'My Sticker Pack',
                public: false,
            },
        ],
    }
)

export const updatePackBodySchema = t.Object(
    {
        name: t.Optional(packNameSchema),
        public: t.Optional(packPublicSchema),
    },
    {
        description:
            'Schema for updating a pack (all fields optional for partial updates)',
        examples: [
            {
                name: 'Updated Pack Name',
            },
            {
                public: true,
            },
            {
                name: 'Complete Update',
                public: false,
            },
        ],
    }
)

export const packIdParamSchema = t.Object({
    id: t.String({
        title: 'Pack ID',
        format: 'uuid',
        description: 'Unique identifier of the pack',
        examples: [1, 42, 999],
        minimum: 1,
    }),
})

export const unsharePackParamSchema = t.Object({
    id: t.String({
        title: 'Pack ID',
        format: 'uuid',
        description: 'Unique identifier of the pack',
    }),
    userId: t.String({
        title: 'User ID',
        format: 'uuid',
        description: 'ID of user to remove share from',
    }),
})

export const getPacksResponseSchema = t.Object(
    {
        data: t.Array(packSchema, {
            description: 'Array of pack objects',
        }),
        meta: paginationMetaSchema,
    },
    {
        description: 'Paginated response containing packs and metadata',
    }
)

export const sharePackBodySchema = t.Object(
    {
        userId: t.String({
            format: 'uuid',
            description: 'ID of the user to share the pack with',
            title: 'User ID',
        }),
        canEdit: t.Boolean({
            description: 'Allow the user to edit the pack',
            default: false,
            examples: [true, false],
        }),
        canDelete: t.Boolean({
            description: 'Allow the user to delete the pack',
            default: false,
            examples: [true, false],
        }),
    },
    {
        description: 'Schema for sharing a pack with another user',
        examples: [
            {
                userId: 'user-123',
                canEdit: true,
                canDelete: false,
            },
        ],
    }
)

export type Pack = typeof packSchema.static
export type GetPacksQuery = typeof getPacksQuerySchema.static
export type GetPacksResponse = typeof getPacksResponseSchema.static
export type CreatePackBody = typeof createPackBodySchema.static
export type UpdatePackBody = typeof updatePackBodySchema.static
export type PackIdParam = typeof packIdParamSchema.static
export type PaginationMeta = typeof paginationMetaSchema.static
export type SharePackBody = typeof sharePackBodySchema.static
