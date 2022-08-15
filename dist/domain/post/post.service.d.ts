import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './post.repository';
export declare class PostService {
    private readonly postRepository;
    constructor(postRepository: PostRepository);
    create(createPostDto: CreatePostDto): Promise<import("./entities/post.entity").Post[]>;
    findAll(uuid: string): Promise<any>;
    findOne(id: number): Promise<any>;
    findAllByUserId(id: string): Promise<any>;
    update(id: number, updatePostDto: UpdatePostDto): Promise<any>;
    remove(id: number): Promise<any>;
}
