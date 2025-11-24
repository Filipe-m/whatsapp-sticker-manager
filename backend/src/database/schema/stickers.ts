import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { packs } from './packs'

export const stickers = pgTable('stickers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    packId: integer('pack_id')
        .notNull()
        .references(() => packs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})
