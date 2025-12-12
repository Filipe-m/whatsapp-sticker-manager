import HttpStatusCode from '@utils/httpStatusCode'
import { t } from 'elysia'

export class NotFoundException extends Error {
    public static schema = t.Object({
        message: t.String({
            description: 'Error message describing what went wrong',
            examples: ['User not found', 'User 123 not found'],
        }),
        status: t.Optional(
            t.Number({
                description: 'Status code for programmatic handling',
                examples: [404],
            })
        ),
    })

    status = HttpStatusCode.NOT_FOUND_404
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
