import { Connection } from 'cypher-query-builder';
import { ConfigService } from '@nestjs/config';
import { Post } from './entities/post.entity';
export declare class PostRepository {
    private readonly connection;
    private readonly configService;
    constructor(connection: Connection, configService: ConfigService);
    private query;
    getPostEntity(id: number): Promise<any>;
    getAllPostsByTreeUUID(uuid: string): Promise<any>;
    findAllByUserId(id: string): Promise<any>;
    addNewPost(postData: any): Promise<Post[]>;
    deletePost(id: number): Promise<any>;
    updatePostEntity(postId: any, postParams: any): Promise<any>;
}
