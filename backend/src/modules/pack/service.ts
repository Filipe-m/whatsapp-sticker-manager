import { db } from '@database/index'
import { packs, type NewPack, type Packs } from '@database/schema/packs'
import { sharedPacks } from '@database/schema/sharedPacks'
import { NotFoundError } from '@utils/errors'
import { and, count, eq, inArray, or } from 'drizzle-orm'
import type { GetPackReponse } from './model'

interface PackFilters {
    userId?: string
    isPublic?: boolean
}

type Permissions = 'edit' | 'delete'

export class PackService {
    static async hasPermission(
        userId: string,
        packId: number,
        permissions: Permissions[]
    ) {
        const whereConditions = []
        if (permissions.includes('delete')) {
            whereConditions.push(eq(sharedPacks.canDelete, true))
        }
        if (permissions.includes('edit')) {
            whereConditions.push(eq(sharedPacks.canEdit, true))
        }
        const finalWhere = and(...whereConditions)

        const pack = await db.query.packs.findFirst({
            where: and(
                eq(packs.id, packId),
                or(
                    eq(packs.owner, userId),
                    inArray(
                        packs.id,
                        db
                            .select({ packId: sharedPacks.packId })
                            .from(sharedPacks)
                            .where(finalWhere)
                    )
                )
            ),
        })

        return !!pack
    }

    static async getPackByID(id: number): Promise<Packs> {
        const pack = await db.query.packs.findFirst({
            where: eq(packs.id, id),
        })

        if (!pack) {
            throw new NotFoundError('Pack', id)
        }

        return pack
    }

    static async getPacks(
        userId: string,
        pageNumber: number,
        pageSize: number,
        filters: PackFilters = {}
    ): Promise<GetPackReponse> {
        try {
            const packsSharedWithUser = db
                .select({ packId: sharedPacks.packId })
                .from(sharedPacks)
                .where(eq(sharedPacks.userId, userId))

            const whereConditions = []

            if (filters.isPublic !== undefined) {
                whereConditions.push(eq(packs.public, filters.isPublic))
            } else {
                whereConditions.push(
                    or(
                        eq(packs.owner, userId),
                        inArray(packs.id, packsSharedWithUser)
                    )
                )
            }

            const finalWhere = and(...whereConditions)

            const [data, countResult] = await Promise.all([
                db.query.packs.findMany({
                    where: finalWhere,
                    orderBy: (packs, { asc }) => asc(packs.id),
                    limit: pageSize,
                    offset: (pageNumber - 1) * pageSize,
                    with: {
                        sharedPacks: {
                            with: {
                                user: true,
                            },
                        },
                    },
                }),

                db.select({ count: count() }).from(packs).where(finalWhere),
            ])

            const totalItems = countResult[0]?.count ?? 0

            return {
                data,
                meta: {
                    page: pageNumber,
                    pageSize: pageSize,
                    total: totalItems,
                    totalPages: Math.ceil(totalItems / pageSize),
                },
            }
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    static async createPack(pack: NewPack): Promise<Packs> {
        const [createdPack] = await db.insert(packs).values(pack).returning()
        return createdPack
    }
}
