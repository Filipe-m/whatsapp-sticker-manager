import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { packs } from './packs'

export const stickers = pgTable('stickers', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => Bun.randomUUIDv7()),
    name: text('name').notNull(),
    objectKey: text('objectKey').notNull(),
    mimeType: text('mimeType').notNull(),
    size: bigint('size', { mode: 'number' }).notNull(),
    packId: uuid('packId')
        .notNull()
        .references(() => packs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})

export type Stickers = typeof stickers.$inferSelect
export type NewSticker = typeof stickers.$inferInsert
