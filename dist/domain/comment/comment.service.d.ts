import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
export declare class CommentService {
    private readonly commentRepository;
    constructor(commentRepository: CommentRepository);
    create(createCommentDto: CreateCommentDto): Promise<import("./entities/comment.entity").Comment[]>;
    findAll(id: number, type: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, updateCommentDto: UpdateCommentDto): Promise<any>;
    remove(id: number): Promise<any>;
}
