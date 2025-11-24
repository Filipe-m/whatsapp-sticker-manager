import { logger } from '@lib/logger'
import { NotFoundError, ValidationError } from '@utils/errors'
import Elysia from 'elysia'

export const errorMiddleware = new Elysia()
    .error({ NotFoundError, ValidationError })
    .onError(({ code, error, status, params, body, path, query }) => {
        const baseLog = { path, params, query, body, error }

        switch (code) {
            case 'NotFoundError': {
                const e = error as NotFoundError
                logger.error(baseLog, `[${e.entity}] not found`)
                return status(e.status, {
                    error: e.message,
                    entity: e.entity,
                    id: e.id,
                })
            }
            case 'ValidationError': {
                const e = error as ValidationError
                logger.error(baseLog, '[VALIDATION_ERROR]')
                return status(e.status, {
                    error: e.message,
                    details: e.details,
                })
            }

            case 'VALIDATION':
                logger.warn(baseLog, '[SCHEMA_VALIDATION_FAIL]')
                return status(422, {
                    error: 'Schema Validation Failed',
                    details: JSON.parse(error.message).summary,
                })

            default:
                logger.error(baseLog, '[UNHANDLED]')
                return status(500, { error: 'Internal server error' })
        }
    })
    .as('global')
