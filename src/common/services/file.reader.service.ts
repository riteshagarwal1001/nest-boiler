import { Injectable } from '@nestjs/common';
const csv = require('csvtojson');
@Injectable()
export class FileReaderServiceService {
    public read(filePath: string) {
        return csv()
            .fromFile(filePath)
            .then(jsonObj => {
                return jsonObj;
            })
            .catch(err => {
                throw err;
            });
    }
}
