"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const aws_sdk_1 = require("aws-sdk");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const file_constants_1 = require("./file.constants");
let FileService = class FileService {
    getS3() {
        return new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }
    async upload(file) {
        const newUuid = (0, uuid_1.v4)();
        const partuuid = newUuid.slice(0, 8);
        const result = await this.uploadS3(file, partuuid);
        return result;
    }
    async uploadS3(file, uuid) {
        const s3 = this.getS3();
        const timestamp = Date.now();
        const fileName = `${uuid}${timestamp}${file.originalname}`;
        const params = {
            Bucket: file_constants_1.S3_BUCKET,
            Key: fileName,
            ContentType: file.mimetype,
            Body: file.buffer,
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    common_1.Logger.error(err);
                    reject(err.message);
                }
                resolve(data);
            });
        });
    }
    async removeFileFromS3(fileKey) {
        const s3 = this.getS3();
        const params = {
            Bucket: file_constants_1.S3_BUCKET,
            Key: fileKey,
        };
        return new Promise((resolve, reject) => {
            const result = s3.deleteObject(params, (err, data) => {
                if (err) {
                    common_1.Logger.error(err);
                    reject(err.message);
                }
                resolve({
                    "response": "done"
                });
            });
        });
    }
    create(createFileDto) {
        return 'This action adds a new file';
    }
    findAll() {
        return `This action returns all file`;
    }
    findOne(id) {
        return `This action returns a #${id} file`;
    }
    update(id, updateFileDto) {
        return `This action updates a #${id} file`;
    }
    remove(id) {
        return `This action removes a #${id} file`;
    }
};
FileService = __decorate([
    (0, common_1.Injectable)()
], FileService);
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map