import { authMiddleware } from '@middlewares/auth'
import { PackService } from '@modules/packs/pack.service'
import { Elysia, t } from 'elysia'
import { stickerSchema } from './sticket.schema'

export const sticker = new Elysia({
    prefix: '/sticker',
    detail: { tags: ['Sticker'] },
})
    .use(authMiddleware)
    .get(
        '',
        async ({ user }) => {
            console.log(user)
            return `Packs for user ${user.name}`
        },
        {
            auth: true,
        }
    )
    .post(
        '',
        async ({ body }) => {
            const pack = await PackService.getPackByID(body.packId)
            console.log(pack)
        },
        {
            auth: true,
            parse: 'multipart/form-data',
            detail: {
                summary: 'Create sticker',
                description: 'Create a new sticker inside a pack',
            },
            body: t.Object({
                packId: t.String({
                    format: 'uuid',
                    title: 'Id of the pack with this sticker is in',
                }),
                file: t.File({
                    format: 'image/*',
                    description: 'File of the sticker to be registered',
                }),
            }),
            response: {
                201: stickerSchema,
            },
        }
    )
