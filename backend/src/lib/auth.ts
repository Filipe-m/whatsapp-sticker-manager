import { db } from '@/database/index'
import { account } from '@database/schema/accounts'
import { session } from '@database/schema/sessions'
import { users } from '@database/schema/users'
import { verifications } from '@database/schema/verifications'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI } from 'better-auth/plugins'
import { Enviroments } from './enviroments'

export const auth = betterAuth({
    plugins: [openAPI()],
    database: drizzleAdapter(db, {
        provider: 'pg',
        usePlural: true,
        schema: {
            users: users,
            accounts: account,
            sessions: session,
            verifications: verifications,
        },
    }),
    basePath: '/auth',
    baseURL: Enviroments.BACKEND_URL,
    secret: Enviroments.AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        disableOriginCheck: true,
    },
})
