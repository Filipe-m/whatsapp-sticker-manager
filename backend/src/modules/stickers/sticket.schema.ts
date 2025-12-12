import { stickers } from '@database/schema/stickers'
import { createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

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
