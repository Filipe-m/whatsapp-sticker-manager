import { db } from '@database/index'
import {
    users,
    type Users as UserRow,
} from '@database/schema/users'
import { logger } from '@lib/logger'
import { count } from 'drizzle-orm'

export interface GetUsersInput {
    pageNumber: number
    pageSize: number
}

export class UserService {

    static async getUsers(input: GetUsersInput) {

        const [data, countResult] = await Promise.all([
            db.query.users.findMany({
                orderBy: (users, { asc }) => asc(users.createdAt),
                limit: input.pageSize,
                offset: (input.pageNumber - 1) * input.pageSize,
            }),
            db.select({ count: count() }).from(users),
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