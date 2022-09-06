import { TreeService } from './tree.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { JoinToTreeDto } from './dto/join-to-tree.dto';
export declare class TreeController {
    private readonly treeService;
    constructor(treeService: TreeService);
    create(createTreeDto: CreateTreeDto): Promise<any>;
    findAll(): string;
    findOne(id: string): Promise<import("./entities/tree.entity").Tree[]>;
    getTreeMembers(id: string): Promise<import("./entities/tree.entity").Tree[]>;
    getPartTreeByUserId(treeId: string, userId: string): Promise<import("./entities/tree.entity").Tree[]>;
    getTreeInPartsUserId(treeId: string, userId: string): Promise<import("./entities/tree.entity").Tree[]>;
    update(id: string, updateTreeDto: UpdateTreeDto): string;
    join(id: string, joinToTreeDto: JoinToTreeDto): Promise<any>;
    remove(id: string): string;
}
