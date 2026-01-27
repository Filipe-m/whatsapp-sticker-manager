import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sharedPacks } from './sharedPacks'
import { users } from './users'

export const packs = pgTable('packs', {
    id: uuid('id')
        .primaryKey()
        .$defaultFn(() => Bun.randomUUIDv7()),
    name: text('name').notNull(),
    owner: uuid('owner')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    public: boolean().default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
})

export const packsRelations = relations(packs, ({ many, one }) => ({
    sharedPacks: many(sharedPacks),
    ownerUser: one(users, {
        fields: [packs.owner],
        references: [users.id],
    }),
}))

export type Packs = typeof packs.$inferSelect
export type NewPack = typeof packs.$inferInsert
