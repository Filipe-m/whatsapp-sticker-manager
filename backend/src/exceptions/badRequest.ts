import HttpStatusCode from '@utils/httpStatusCode'
import { t } from 'elysia'

export class BadRequestException extends Error {
    public static schema = t.Object({
        message: t.String({
            description: 'Error message describing what went wrong',
            examples: ['Bad request'],
        }),
        status: t.Optional(
            t.Number({
                description: 'Status code for programmatic handling',
                examples: [400],
            })
        ),
    })

    status = HttpStatusCode.BAD_REQUEST_400
    constructor(message: string) {
        super(message)
    }

    toResponse() {
        return Response.json(
            {
                error: this.message,
                status: this.status,
            },
            {
                status: this.status,
            }
        )
    }
}
