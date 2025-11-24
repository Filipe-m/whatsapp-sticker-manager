import { Enviroments } from '@lib/enviroments'
import { logger } from '@lib/logger'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { schema } from './schema'

const pool = new Pool({
    database: Enviroments.DB_NAME,
    password: Enviroments.DB_PASS,
    host: Enviroments.DB_HOST,
    port: Enviroments.DB_PORT,
    user: Enviroments.DB_USER,
    ssl: false,
})

export const db = drizzle({
    client: pool,
    casing: 'snake_case',
    schema: schema,
})

try {
    await migrate(db, { migrationsFolder: './migrations' })
    console.log('Migration completed successfully.')
} catch (error) {
    logger.error(error, 'Migration failed :')
}
