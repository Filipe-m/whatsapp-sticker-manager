import * as Minio from 'minio'
import { Enviroments } from './enviroments'

let minio: Minio.Client

export class MinioClient {
    private instance: Minio.Client

    private createMinioClient() {
        return new Minio.Client({
            endPoint: Enviroments.MINIO_END_POINT,
            port: Enviroments.MINIO_PORT,
            accessKey: Enviroments.MINIO_USER,
            secretKey: Enviroments.MINIO_PASSWORD,
        })
    }

    constructor() {
        if (!minio) {
            this.instance = this.createMinioClient()
            minio = this.instance
        } else {
            this.instance = minio
        }
    }

    public getClient() {
        return this.instance
    }
}
