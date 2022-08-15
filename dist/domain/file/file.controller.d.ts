import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    upload(file: any): Promise<unknown>;
    create(createFileDto: CreateFileDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateFileDto: UpdateFileDto): string;
    remove(id: string): Promise<unknown>;
}
