import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './post.repository';
import { FileService } from "../file/file.service";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly fileService: FileService
  ) {}

  async create(createPostDto: CreatePostDto) {
    const result = await this.postRepository.addNewPost(createPostDto);
    return result;
  }

  async findAll(uuid: string) {
    const result = await this.postRepository.getAllPostsByTreeUUID(uuid);
    return result;
  }

  async findOne(id: number) {
    const result = await this.postRepository.getPostEntity(id);
    return result;
  }

  async findAllByUserId(id: string) {
    const result = await this.postRepository.findAllByUserId(+id);
    return result;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const result = await this.postRepository.updatePostEntity(id, updatePostDto);
    return result;
  }

  async remove(id: number) {
    const file = await this.postRepository.getPostEntity(id);
    console.log('file', file);
    await this.fileService.removeFileFromS3('5b11ef1f1687852032000/11b411271687852032000CAB608F8-4E4D-4B73-8129-4EE10E4BAAAF.jpg');
    const result = await this.postRepository.deletePost(id);
    return result;
  }
}
