import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as config from 'config';
const ocrConfig: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
} = config.get('ocr');
const aws = require('aws-sdk');
const fs = require('fs');
aws.config.update({
    accessKeyId: ocrConfig.accessKeyId,
    secretAccessKey: ocrConfig.secretAccessKey,
    region: ocrConfig.region,
});

@Injectable()
export class S3Service {
    public async upload(
        fileName: string,
        filePath: string,
        s3Bucket: string,
    ): Promise<{
        ETag: string;
        Location: string;
        key: string;
        Key: string;
        Bucket: string;
    }> {
        if (/\s/.test(fileName)) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'File name cannot have any space',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const s3 = new aws.S3();
        const buffer = fs.readFileSync(filePath);
        const params = {
            Bucket: s3Bucket,
            Key: fileName,
            Body: buffer,
        };
        return s3
            .upload(params)
            .promise()
            .then(response => {
                return response;
            });
    }

    public async download(fileName: string, s3Bucket: string) {
        const s3 = new aws.S3();
        const params = {
            Bucket: s3Bucket,
            Key: fileName,
        };
        let s3Response = null;
        await s3
            .getObject(params)
            .promise()
            .then(data => {
                s3Response = data.Body;
            });
        return s3Response;
    }
}
