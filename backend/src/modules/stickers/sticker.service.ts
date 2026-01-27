import { BadRequestException } from '@/exceptions/badRequest'
import { NotFoundException } from '@/exceptions/notFound'
import { db } from '@database/index'
import { packs } from '@database/schema/packs'
import {
    stickers,
    type NewSticker,
    type Stickers as StickerRow,
} from '@database/schema/stickers'
import { logger } from '@lib/logger'
import { getObjectStorage } from '@lib/storage/storage'
import { PackService } from '@modules/packs/pack.service'
import { and, count, eq, ilike } from 'drizzle-orm'

export interface CreateStickerInput {
    userId: string
    packId: string
    file: File
    name?: string
}

export interface GetStickersInput {
    userId: string
    packId: string
    pageNumber: number
    pageSize: number
    search?: string
}

function normalizeStickerName(input: string): string {
    const trimmed = input.trim()
    if (!trimmed) return 'sticker'
    return trimmed.slice(0, 100)
}

function nameFromFile(fileName: string): string {
    const base = fileName.split('/').pop() ?? fileName
    const withoutExt = base.replace(/\.[^/.]+$/, '')
    return normalizeStickerName(withoutExt)
}

function getExtensionFromFileName(fileName: string): string {
    const base = fileName.split('/').pop() ?? fileName
    const match = /\.([A-Za-z0-9]+)$/.exec(base)
    return match ? `.${match[1]}` : ''
}

function assertStickerMimeType(mimeType: string): void {
    if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) return
    throw new BadRequestException(`Unsupported sticker mimeType: ${mimeType}`)
}

export class StickerService {
    static async getStickerById(id: string): Promise<StickerRow | null> {
        const sticker = await db.query.stickers.findFirst({
            where: eq(stickers.id, id),
        })
        return sticker ?? null
    }

    static async getStickers(input: GetStickersInput) {
        await PackService.assertUserHasPermission(input.userId, input.packId, [
            'view',
        ])

        const whereConditions = [eq(stickers.packId, input.packId)]

        if (input.search) {
            whereConditions.push(ilike(stickers.name, `%${input.search}%`))
        }

        const where =
            whereConditions.length > 1
                ? and(...whereConditions)
                : whereConditions[0]

        const [data, countResult] = await Promise.all([
            db.query.stickers.findMany({
                where,
                orderBy: (stickers, { asc }) => asc(stickers.createdAt),
                limit: input.pageSize,
                offset: (input.pageNumber - 1) * input.pageSize,
            }),
            db.select({ count: count() }).from(stickers).where(where),
        ])

        const totalItems = countResult[0]?.count ?? 0

        return {
            data,
            meta: {
                page: input.pageNumber,
                pageSize: input.pageSize,
                total: totalItems,
                totalPages: Math.ceil(totalItems / input.pageSize),
            },
        }
    }

    static async createSticker(input: CreateStickerInput): Promise<StickerRow> {
        await PackService.assertUserHasPermission(input.userId, input.packId, [
            'edit',
        ])

        const pack = await db.query.packs.findFirst({
            where: eq(packs.id, input.packId),
        })
        if (!pack) {
            throw new NotFoundException(
                `Pack with ID ${input.packId} not found`
            )
        }

        const mimeType = input.file.type || 'application/octet-stream'
        assertStickerMimeType(mimeType)

        const stickerId = Bun.randomUUIDv7()
        const extension = getExtensionFromFileName(input.file.name)
        const objectKey = `packs/${input.packId}/stickers/${stickerId}${extension}`

        const name = input.name
            ? normalizeStickerName(input.name)
            : nameFromFile(input.file.name)

        const bytes = new Uint8Array(await input.file.arrayBuffer())

        const storage = getObjectStorage()

        await storage.putObject({
            key: objectKey,
            data: bytes,
            contentType: mimeType,
            size: input.file.size,
        })

        const newSticker: NewSticker = {
            id: stickerId,
            name,
            packId: input.packId,
            objectKey,
            mimeType,
            size: input.file.size,
        }

        try {
            const [created] = await db
                .insert(stickers)
                .values(newSticker)
                .returning()

            if (!created) {
                throw new Error('Failed to create sticker')
            }

            return created
        } catch (error) {
            logger.error(
                { err: error, objectKey },
                'Sticker DB insert failed; attempting object cleanup'
            )
            try {
                await storage.deleteObject(objectKey)
            } catch (cleanupError) {
                logger.error(
                    { err: cleanupError, objectKey },
                    'Failed to cleanup object after sticker insert failure'
                )
            }
            throw error
        }
    }

    static async deleteSticker(
        userId: string,
        stickerId: string
    ): Promise<void> {
        const sticker = await this.getStickerById(stickerId)
        if (!sticker) {
            throw new NotFoundException(
                `Sticker with ID ${stickerId} not found`
            )
        }

        await PackService.assertUserHasPermission(userId, sticker.packId, [
            'delete',
        ])

        const storage = getObjectStorage()
        await storage.deleteObject(sticker.objectKey)

        const [deleted] = await db
            .delete(stickers)
            .where(
                and(
                    eq(stickers.id, stickerId),
                    eq(stickers.packId, sticker.packId)
                )
            )
            .returning()

        if (!deleted) {
            throw new NotFoundException(
                `Sticker with ID ${stickerId} not found`
            )
        }
    }
}
