import { paginationMetaSchema } from '@modules/packs/pack.schema'
import { t } from 'elysia'

export const userSchema = t.Object({
    id: t.String({ format: 'uuid', title: 'User ID' }),
    name: t.String({ title: 'User name' }),
    email: t.String({ format: 'email', title: 'User email' }),
    emailVerified: t.Boolean({ title: 'Email verified status' }),
    image: t.Nullable(t.String({ format: 'uri', title: 'User image URL' })),
    createdAt: t.String({ format: 'date-time', title: 'Creation timestamp' }),
    updatedAt: t.String({
        format: 'date-time',
        title: 'Last update timestamp',
    }),
})

export const getUsersQuerySchema = t.Object({
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

export const getUsersResponseSchema = t.Object({
    data: t.Array(userSchema),
    meta: paginationMetaSchema,
})
