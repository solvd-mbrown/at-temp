import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class FileService {

  async upload(file) {
    // const { originalname } = file;
    const bucketS3 = 'file-storage-for-arr-tree';
    const newUuid = uuidv4();
    const result = await this.uploadS3(file.buffer, bucketS3, newUuid);
    return result;
  }

  async uploadS3(file, bucket, uuid) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
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

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
