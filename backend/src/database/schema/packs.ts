import { relations } from 'drizzle-orm'
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { sharedPacks } from './sharedPacks'
import { users } from './users'

export const packs = pgTable('packs', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    owner: text('owner')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    public: boolean().default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})

export const packsRelations = relations(packs, ({ many }) => ({
    sharedPacks: many(sharedPacks),
}))

export type Packs = typeof packs.$inferSelect
export type NewPack = typeof packs.$inferInsert
