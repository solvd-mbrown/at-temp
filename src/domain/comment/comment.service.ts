import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetAllCommentDto } from './dto/get-all-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
  ) {}
  
  async create(createCommentDto: CreateCommentDto) {
    const result = await this.commentRepository.addNewComment(createCommentDto);
    return result;
  }

  async findAll(id: number, type: string) {
    const result = await this.commentRepository.getAllCommentsByIds(id, type);
    return result;
  }

  async findOne(id: number) {
    const result = await this.commentRepository.getCommentEntity(id);
    return result;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const result = await this.commentRepository.updateCommentEntity(id, updateCommentDto);
    return result;
  }

  async remove(id: number) {
    const result = await this.commentRepository.deleteComment(id);
    return result;
  }
}
