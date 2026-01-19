import '@database/index'
import { cors } from '@elysiajs/cors'
import openapi from '@elysiajs/openapi'
import { auth } from '@lib/auth'
import { Enviroments } from '@lib/enviroments'
import { logger } from '@lib/logger'
import { authMiddleware } from '@middlewares/auth'
import { pack } from '@modules/packs/pack.controller'
import { sticker } from '@modules/stickers/sticker.controller'
import { user } from '@modules/users/user.controller'
import { openApiConfig } from '@utils/openApi'
import { Elysia } from 'elysia'
import { NotFoundException } from './exceptions/notFound'

new Elysia({
    allowUnsafeValidationDetails: true,
})
    .use(cors())
    .decorate('logger', logger)
    .error({ NotFoundException })
    .get('/health', () => 'Sucess')
    .mount(auth.handler)
    .use(authMiddleware)
    .use(pack)
    .use(sticker)
    .use(user)
    .use(openapi(openApiConfig))
    .listen(Enviroments.PORT, () =>
        logger.info(
            `\nServer is running on port: ${Enviroments.PORT}\nSee the docs at localhost:${Enviroments.PORT}/docs`
        )
    )
