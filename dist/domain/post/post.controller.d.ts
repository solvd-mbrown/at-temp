import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    create(createPostDto: CreatePostDto): Promise<import("./entities/post.entity").Post[]>;
    findAll(id: string): Promise<any>;
    findOne(id: string): Promise<any>;
    findAllByUserId(id: string): Promise<any>;
    update(id: string, updatePostDto: UpdatePostDto): Promise<any>;
    remove(id: string): Promise<any>;
}
