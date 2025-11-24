import dotenv from 'dotenv'
import * as z from 'zod'
import { logger } from './logger'

dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    quiet: true,
})

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('production'),
    PORT: z.coerce.number().positive().default(8080),
    BACKEND_URL: z.url().default('http://localhost:8080'),

    DB_HOST: z.string().default('localhost'),
    DB_NAME: z.string().default('whatsapp_sticket_manager'),
    DB_USER: z.string().default('postgres'),
    DB_PASS: z.string().default('postgres'),
    DB_PORT: z.coerce.number().positive().default(5432),

    MINIO_END_POINT: z.string().default('127.0.0.1'),
    MINIO_PORT: z.coerce.number().positive().default(9000),
    MINIO_USER: z.string().default('minioadmin'),
    MINIO_PASSWORD: z.string().default('minioadmin'),
    BUCKET_NAME: z.string().default('ws-stickers'),

    AUTH_SECRET: z.string().default('O3mEiUlhjSYsyxYqqcTsdaZlIDXP6Gzd'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
    logger.error(
        {
            error: parsedEnv.error,
        },
        'Environment (.env) validation error:'
    )
    process.exit(1)
}

export const Enviroments = parsedEnv.data
