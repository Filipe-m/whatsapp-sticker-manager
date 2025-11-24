/* eslint-disable  @typescript-eslint/no-explicit-any */
import { auth } from '../lib/auth'

/**
 * OpenAPI Schema Generator
 * @description Generates OpenAPI schema for the authentication module.
 * @returns {Promise<any>} OpenAPI schema object
 */

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

const OpenAPI = {
    getPaths: (prefix = '/auth') =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)

            for (const path of Object.keys(paths)) {
                const key = prefix + path
                reference[key] = paths[path]

                for (const method of Object.keys(paths[path])) {
                    const operation = (reference[key] as any)[method]

                    operation.tags = ['Auth']
                }
            }

            return reference
        }) as Promise<any>,
    components: getSchema().then(
        ({ components }) => components
    ) as Promise<any>,
} as const

export const openApiConfig = {
    path: '/docs',
    documentation: {
        info: {
            title: 'Whatsapp Sticker Manager API',
            description: 'API for managing WhatsApp stickers',
            version: '1.0.0',
        },
        components: {
            ...(await OpenAPI.components),
            securitySchemes: {
                sessionCookie: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'better-auth.session_token',
                },
            },
        },
        paths: await OpenAPI.getPaths(),
        openapi: '3.0.0',
    },
}
