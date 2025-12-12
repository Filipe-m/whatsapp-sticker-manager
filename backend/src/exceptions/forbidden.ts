import HttpStatusCode from '@utils/httpStatusCode'
import { t } from 'elysia'

export class ForbiddenException extends Error {
    public static schema = t.Object({
        message: t.String({
            description: 'Error message describing what went wrong',
            examples: ['Forbidden'],
        }),
        status: t.Optional(
            t.Number({
                description: 'Status code for programmatic handling',
                examples: [403],
            })
        ),
    })

    status = HttpStatusCode.FORBIDDEN_403
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
