import { Connection } from 'cypher-query-builder';
import { ConfigService } from '@nestjs/config';
import { Comment } from './entities/comment.entity';
import { PostRepository } from '../post/post.repository';
export declare class CommentRepository {
    private readonly connection;
    private readonly configService;
    private readonly postRepository;
    constructor(connection: Connection, configService: ConfigService, postRepository: PostRepository);
    private query;
    addNewComment(commentData: any): Promise<Comment[]>;
    getCommentEntity(id: number): Promise<any>;
    getAllCommentsByIds(id: number, type: string): Promise<any>;
    deleteComment(id: number): Promise<any>;
    updateCommentEntity(commentId: any, commentParams: any): Promise<any>;
}
