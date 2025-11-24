export class NotFoundError extends Error {
    status = 404
    constructor(
        public entity: string,
        public id?: string | number
    ) {
        super(`${entity} not found`)
        this.name = 'NOT_FOUND'
    }
}

export class ValidationError extends Error {
    status = 422
    constructor(public details: Record<string, string>) {
        super('Validation failed')
        this.name = 'ValidationError'
    }
}
