import { ForbiddenException } from '@/exceptions/forbidden'
import { NotFoundException } from '@/exceptions/notFound'
import { db } from '@database/index'
import { packs, type NewPack, type Packs } from '@database/schema/packs'
import { sharedPacks } from '@database/schema/sharedPacks'
import { and, count, eq, inArray, or, type SQL } from 'drizzle-orm'
import type { GetPacksResponse } from './pack.schema'

interface PackFilters {
    userId?: string
    isPublic?: boolean
}

type Permission = 'view' | 'edit' | 'delete'

export class PackService {
    static async assertUserHasPermission(
        userId: string,
        packId: Packs['id'],
        permissions: Permission[]
    ): Promise<void> {
        const sharedPackConditions: SQL[] = []

        if (permissions.includes('delete')) {
            sharedPackConditions.push(eq(sharedPacks.canDelete, true))
        }
        if (permissions.includes('edit')) {
            sharedPackConditions.push(eq(sharedPacks.canEdit, true))
        }

        const sharedPackWhere =
            sharedPackConditions.length > 0
                ? and(eq(sharedPacks.userId, userId), ...sharedPackConditions)
                : eq(sharedPacks.userId, userId)

        // User has permission if they own the pack OR have appropriate shared access
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
                            .where(sharedPackWhere)
                    )
                )
            ),
        })

        if (!pack) {
            throw new ForbiddenException(
                `User ${userId} does not have permission to access pack ${packId}`
            )
        }
    }

    static async getPackByID(id: string): Promise<Packs | null> {
        const pack = await db.query.packs.findFirst({
            where: eq(packs.id, id),
        })

        return pack ?? null
    }

    static async getPacks(
        userId: string,
        pageNumber: number,
        pageSize: number,
        filters: PackFilters = {}
    ): Promise<GetPacksResponse> {
        const packsSharedWithUser = db
            .select({ packId: sharedPacks.packId })
            .from(sharedPacks)
            .where(eq(sharedPacks.userId, userId))

        const whereConditions: (SQL | undefined)[] = []

        if (filters.isPublic !== undefined) {
            whereConditions.push(eq(packs.public, filters.isPublic))
        }

        if (filters.isPublic === undefined) {
            whereConditions.push(
                or(
                    eq(packs.owner, userId),
                    inArray(packs.id, packsSharedWithUser)
                )
            )
        }

        const finalWhere =
            whereConditions.length > 0
                ? and(...whereConditions.filter(Boolean))
                : undefined

        const [data, countResult] = await Promise.all([
            db.query.packs.findMany({
                ...(finalWhere && { where: finalWhere }),
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

            finalWhere
                ? db.select({ count: count() }).from(packs).where(finalWhere)
                : db.select({ count: count() }).from(packs),
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
    }

    static async createPack(pack: NewPack): Promise<Packs> {
        const [createdPack] = await db.insert(packs).values(pack).returning()

        if (!createdPack) {
            throw new Error('Failed to create pack')
        }

        return createdPack
    }

    static async updatePack(
        id: string,
        updates: Partial<
            Omit<Packs, 'id' | 'owner' | 'createdAt' | 'updatedAt'>
        >
    ): Promise<Packs> {
        const sanitizedUpdates = {
            ...updates,
            ...(updates.name && { name: updates.name.trim() }),
        }

        const [updatedPack] = await db
            .update(packs)
            .set(sanitizedUpdates)
            .where(eq(packs.id, id))
            .returning()

        if (!updatedPack) {
            throw new NotFoundException(`Pack with id ${id} not found`)
        }

        return updatedPack
    }

    static async deletePack(id: string): Promise<void> {
        const [deletedPack] = await db
            .delete(packs)
            .where(eq(packs.id, id))
            .returning()

        if (!deletedPack) {
            throw new NotFoundException(`Pack with id ${id} not found`)
        }
    }
}
