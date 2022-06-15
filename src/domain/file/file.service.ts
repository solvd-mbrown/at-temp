import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import {v4 as uuidv4} from 'uuid';
import { S3_BUCKET } from './file.constants';

@Injectable()
export class FileService {

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async upload(file) {
    const newUuid = uuidv4();
    const result = await this.uploadS3(file.buffer, newUuid);
    return result;
  }

  async uploadS3(file, uuid) {
    const s3 = this.getS3();
    const params = {
      Bucket: S3_BUCKET,
      Key: String(uuid),
      Body: file,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

 async removeFileFromS3(fileKey) {
    const s3 = this.getS3();
    const params = {
      Bucket: S3_BUCKET,
      Key: fileKey,
    };
    return new Promise((resolve, reject) => {
     const result = s3.deleteObject(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve( {
          "response": "done"
        });
      });
    });
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
