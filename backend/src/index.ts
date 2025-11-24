import '@database/index'
import { cors } from '@elysiajs/cors'
import openapi from '@elysiajs/openapi'
import { auth } from '@lib/auth'
import { Enviroments } from '@lib/enviroments'
import { logger } from '@lib/logger'
import { authMiddleware } from '@middlewares/auth'
import { errorMiddleware } from '@middlewares/error'
import { pack } from '@modules/pack/controller'
import { sticker } from '@modules/sticker/controller'
import { openApiConfig } from '@utils/openApi'
import { Elysia } from 'elysia'

new Elysia({
    allowUnsafeValidationDetails: true,
})
    .use(cors())
    .decorate('logger', logger)
    .use(errorMiddleware)
    .get('/health', () => 'Sucess')
    .mount(auth.handler)
    .use(authMiddleware)
    .use(pack)
    .use(sticker)
    .use(openapi(openApiConfig))
    .listen(Enviroments.PORT, () =>
        logger.info(
            `\nServer is running on port: ${Enviroments.PORT}\nSee the docs at localhost:${Enviroments.PORT}/docs`
        )
    )
