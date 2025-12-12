import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { packs } from './packs'

export const stickers = pgTable('stickers', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => Bun.randomUUIDv7()),
    name: text('name').notNull(),
    packId: uuid('packId')
        .notNull()
        .references(() => packs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})
