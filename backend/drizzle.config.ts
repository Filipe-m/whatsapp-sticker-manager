import { Enviroments } from '@lib/enviroments'
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    out: './migrations',
    schema: './src/database/schema',
    dialect: 'postgresql',
    dbCredentials: {
        database: Enviroments.DB_NAME,
        password: Enviroments.DB_PASS,
        host: Enviroments.DB_HOST,
        port: Enviroments.DB_PORT,
        user: Enviroments.DB_USER,
        ssl: false,
    },
})
