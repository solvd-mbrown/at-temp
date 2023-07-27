import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
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
    const result = await this.postRepository.deletePost(id);
    return result;;
  }
}
