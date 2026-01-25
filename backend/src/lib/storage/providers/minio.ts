import { Enviroments } from '@lib/enviroments'
import { S3Client } from 'bun'
import type { ObjectStorageProvider, PutObjectInput } from '../storage'

let minio: S3Client

export class MinioStorageProvider implements ObjectStorageProvider {
    private client: S3Client

    constructor() {
        try {
            if (!minio) {
                minio = new S3Client({
                    accessKeyId: Enviroments.MINIO_USER,
                    secretAccessKey: Enviroments.MINIO_PASSWORD,
                    bucket: Enviroments.BUCKET_NAME,
                    endpoint: Enviroments.MINIO_END_POINT,
                })
            }
            this.client = minio
        } catch (error) {
            console.error('Error initializing Minio client:', error)
            throw error
        }
    }

    async putObject(input: PutObjectInput): Promise<void> {
        await this.client.write(input.key, Buffer.from(input.data))
    }

    async getObjectStream(key: string): Promise<ReadableStream> {
        const file = this.client.file(key)
        return file.stream()
    }

    async deleteObject(key: string): Promise<void> {
        await this.client.delete(key)
    }
}
