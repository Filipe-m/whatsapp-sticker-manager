import { db } from '@database/index'
import { users } from '@database/schema/users'
import { and, count, ilike, ne, or } from 'drizzle-orm'

export interface GetUsersInput {
    pageNumber: number
    pageSize: number
    search?: string
    excludeUserId?: string
}

export class UserService {
    static async getUsers(input: GetUsersInput) {
        const whereConditions = []

        if (input.search) {
            whereConditions.push(
                or(
                    ilike(users.name, `%${input.search}%`),
                    ilike(users.email, `%${input.search}%`)
                )
            )
        }

        if (input.excludeUserId) {
            whereConditions.push(ne(users.id, input.excludeUserId))
        }

        const where =
            whereConditions.length > 0 ? and(...whereConditions) : undefined

        const [data, countResult] = await Promise.all([
            db.query.users.findMany({
                ...(where && { where }),
                orderBy: (users, { asc }) => asc(users.createdAt),
                limit: input.pageSize,
                offset: (input.pageNumber - 1) * input.pageSize,
            }),
            where
                ? db.select({ count: count() }).from(users).where(where)
                : db.select({ count: count() }).from(users),
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
}
