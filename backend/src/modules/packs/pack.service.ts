import { ForbiddenException } from '@/exceptions/forbidden'
import { NotFoundException } from '@/exceptions/notFound'
import { db } from '@database/index'
import { packs, type NewPack, type Packs } from '@database/schema/packs'
import { sharedPacks, type NewSharedPack } from '@database/schema/sharedPacks'
import { and, count, eq, ilike, inArray, or, type SQL } from 'drizzle-orm'
import type { GetPacksResponse } from './pack.schema'

interface PackFilters {
    owned?: boolean
    public?: boolean
    shared?: boolean
    search?: string
}

type Permission = 'view' | 'edit' | 'delete'

export class PackService {
    static async assertUserHasPermission(
        userId: string,
        packId: Packs['id'],
        permissions: Permission[]
    ): Promise<void> {
        const pack = await db.query.packs.findFirst({
            where: eq(packs.id, packId),
        })

        if (!pack) {
            throw new NotFoundException(`Pack with id ${packId} not found`)
        }

        if (permissions.includes('view') && pack.public) {
            return
        }

        if (pack.owner === userId) {
            return
        }

        const sharedPackConditions: SQL[] = [eq(sharedPacks.userId, userId)]

        if (permissions.includes('delete')) {
            sharedPackConditions.push(eq(sharedPacks.canDelete, true))
        }
        if (permissions.includes('edit')) {
            sharedPackConditions.push(eq(sharedPacks.canEdit, true))
        }

        const sharedPack = await db.query.sharedPacks.findFirst({
            where: and(eq(sharedPacks.packId, packId), ...sharedPackConditions),
        })

        if (!sharedPack) {
            throw new ForbiddenException(
                `User ${userId} does not have permission to access pack ${packId}`
            )
        }
    }

    static async getPackByID(id: string): Promise<Packs | null> {
        const pack = await db.query.packs.findFirst({
            where: eq(packs.id, id),
            with: {
                ownerUser: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                sharedPacks: {
                    with: {
                        user: true,
                    },
                },
            },
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

        // Se nenhum filtro foi especificado, retorna tudo (owned + shared + public)
        const noFiltersSpecified =
            filters.owned === undefined &&
            filters.public === undefined &&
            filters.shared === undefined

        const ownershipConditions: SQL[] = []

        if (noFiltersSpecified || filters.owned) {
            ownershipConditions.push(eq(packs.owner, userId))
        }

        if (noFiltersSpecified || filters.shared) {
            ownershipConditions.push(inArray(packs.id, packsSharedWithUser))
        }

        if (noFiltersSpecified || filters.public) {
            ownershipConditions.push(eq(packs.public, true))
        }

        const whereConditions: SQL[] = []

        if (ownershipConditions.length > 0) {
            whereConditions.push(or(...ownershipConditions)!)
        }

        if (filters.search) {
            whereConditions.push(ilike(packs.name, `%${filters.search}%`))
        }

        const finalWhere =
            whereConditions.length > 0 ? and(...whereConditions) : undefined

        const [data, countResult] = await Promise.all([
            db.query.packs.findMany({
                ...(finalWhere && { where: finalWhere }),
                orderBy: (packs, { asc }) => asc(packs.id),
                limit: pageSize,
                offset: (pageNumber - 1) * pageSize,
                with: {
                    ownerUser: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
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

    static async sharePack(
        packId: string,
        userId: string,
        permissions: {
            canEdit: boolean
            canDelete: boolean
        }
    ): Promise<NewSharedPack> {
        const sharedPack = await db
            .insert(sharedPacks)
            .values({
                packId,
                userId,
                canEdit: permissions.canEdit,
                canDelete: permissions.canDelete,
            })
            .onConflictDoUpdate({
                target: [sharedPacks.packId, sharedPacks.userId],
                set: {
                    canEdit: permissions.canEdit,
                    canDelete: permissions.canDelete,
                    updatedAt: new Date(),
                },
            })
            .returning()

        if (!sharedPack || sharedPack.length === 0) {
            throw new Error('Failed to share pack')
        }

        return sharedPack[0]
    }

    static async unsharePack(packId: string, userId: string): Promise<void> {
        const [deleted] = await db
            .delete(sharedPacks)
            .where(
                and(
                    eq(sharedPacks.packId, packId),
                    eq(sharedPacks.userId, userId)
                )
            )
            .returning()

        if (!deleted) {
            throw new NotFoundException(
                `Share not found for pack ${packId} and user ${userId}`
            )
        }
    }
}
