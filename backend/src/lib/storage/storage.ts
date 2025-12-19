import { Enviroments } from '@lib/enviroments'
import { MinioStorageProvider } from './providers/minio'

export interface PutObjectInput {
    key: string
    data: Uint8Array
    contentType: string
    size: number
}

export interface ObjectStorageProvider {
    putObject(input: PutObjectInput): Promise<void>
    getObjectStream(key: string): Promise<ReadableStream>
    deleteObject(key: string): Promise<void>
}

let storageProvider: ObjectStorageProvider | undefined

export function getObjectStorage(): ObjectStorageProvider {
    if (storageProvider) return storageProvider

    const provider = Enviroments.STORAGE_PROVIDER

    if (provider === 'minio') {
        storageProvider = new MinioStorageProvider()
        return storageProvider
    }

    throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`)
}
