import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { FileService } from "./file.service";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FirebaseAuthGuard } from "src/services/auth/firebase/firebase-auth.guard";

@Controller("file")
// @UseGuards(FirebaseAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post("upload/:email")
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file, @Param("email") email: string) {
    return await this.fileService.upload(file, email);
  }

  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return this.fileService.create(createFileDto);
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.fileService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.fileService.removeFileFromS3(id);
  }
}
