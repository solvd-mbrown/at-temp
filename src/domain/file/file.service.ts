import { S3 } from "aws-sdk";
import { Logger, Injectable } from "@nestjs/common";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { v4 as uuidv4 } from "uuid";
import { S3_BUCKET_DEV, S3_TAG_KEYS } from "./file.constants";
import { UserRepository } from "../user/user.repository";
import * as converter from "json-2-csv";
import { User } from "../user/entities/user.entity";

@Injectable()
export class FileService {
  constructor(private readonly userRepository: UserRepository) {}

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async upload(file: Express.Multer.File, email: string) {
    let user = await this.userRepository.getUserFromEmail(email);
    const timestamp = Date.now();
    const iddateUser = `${uuidv4().slice(0, 8)}${timestamp}`;
    const iddateFile = `${uuidv4().slice(0, 8)}${timestamp}`;
    if (!user?.storageFolderId) {
      user = await this.userRepository.updateUserEntity(user.id, {
        storageFolderId: iddateUser,
      });
    }

    const fileName = `${user.storageFolderId}/${iddateFile}${file.originalname}`;

    const result = await this.uploadS3(file, fileName, email);
    return result;
  }

  async uploadS3(file: Express.Multer.File, fileName: string, email: string) {
    const s3 = this.getS3();
    const params: S3.PutObjectRequest = {
      Bucket: S3_BUCKET_DEV,
      Key: fileName,
      ContentType: file.mimetype,
      Body: file.buffer,
      Tagging: `${S3_TAG_KEYS.email}=${email}`,
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
      Bucket: S3_BUCKET_DEV,
      Key: fileKey,
    };
    return new Promise((resolve, reject) => {
      const result = s3.deleteObject(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve({
          response: "done",
        });
      });
    });
  }

  create(createFileDto: CreateFileDto) {
    return "This action adds a new file";
  }

  findAll() {
    return `This action returns all file`;
  }

  async findOne(id: number) {
    return `This action returns ${id} file`;
  }

  async getUploadSizeByEmailReport(users: User[]): Promise<any> {
    const s3 = this.getS3();
    let groupedByStorePrefix = {};
    let truncated = true;
    let bucketParams: S3.Types.ListObjectsV2Request = { Bucket: S3_BUCKET_DEV };

    const usersWithStorageFileIdObject = users.reduce((acc, user) => {
      acc[user.storageFolderId] = user.email;
      return acc;
    }, {});

    const loopBucket = async () => {
      while (truncated) {
        const res = await s3.listObjectsV2(bucketParams).promise();
        truncated = res?.IsTruncated;

        res.Contents.forEach((item) => {
          const storageFolderId = item.Key.split("/")[0];
          groupedByStorePrefix = {
            ...groupedByStorePrefix,
            [storageFolderId]:
              item.Size + (groupedByStorePrefix[storageFolderId] || 0),
          };
        });

        if (truncated) {
          bucketParams.ContinuationToken = res.NextContinuationToken;
        }
      }
    };

    await loopBucket();

    const groupedByEmailJson = Object.entries(groupedByStorePrefix)
      .map(([key, size]: [string, number]) => {
        const email = usersWithStorageFileIdObject[key];

        if (!email) return null;

        const data = { email, size: this.convertBytes(size) };
        return data;
      })
      .filter(Boolean);

    // const csv = await converter.json2csvAsync(groupedByEmailJson);
    // return csv;
    return groupedByEmailJson;
  }

  private convertBytes(bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (bytes == 0) {
      return 0;
    }

    const i = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`);

    if (i == 0) {
      return bytes + " " + sizes[i];
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
