import { S3 } from 'aws-sdk';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
export declare class FileService {
    getS3(): S3;
    upload(file: any): Promise<unknown>;
    uploadS3(file: any, uuid: any): Promise<unknown>;
    removeFileFromS3(fileKey: any): Promise<unknown>;
    create(createFileDto: CreateFileDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateFileDto: UpdateFileDto): string;
    remove(id: number): string;
}
