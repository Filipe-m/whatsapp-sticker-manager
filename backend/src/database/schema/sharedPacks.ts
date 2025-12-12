import { relations } from 'drizzle-orm'
import { boolean, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { packs } from './packs'
import { users } from './users'

export const sharedPacks = pgTable(
    'shared_packs',
    {
        id: uuid('id')
            .primaryKey()
            .$defaultFn(() => Bun.randomUUIDv7()),
        packId: uuid('packId')
            .notNull()
            .references(() => packs.id, { onDelete: 'cascade' }),
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        public: boolean('public').default(false).notNull(),
        canDelete: boolean('canDelete').default(false).notNull(),
        canEdit: boolean('canEdit').default(false).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (t) => [unique().on(t.packId, t.userId)]
)

export const sharedPacksRelations = relations(sharedPacks, ({ one }) => ({
    pack: one(packs, {
        fields: [sharedPacks.packId],
        references: [packs.id],
    }),
    user: one(users, {
        fields: [sharedPacks.userId],
        references: [users.id],
    }),
}))

export type SharedPacks = typeof sharedPacks.$inferSelect
export type NewSharedPack = typeof sharedPacks.$inferInsert
