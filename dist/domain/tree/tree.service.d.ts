import { UpdateTreeDto } from './dto/update-tree.dto';
import { TreeRepository } from './tree.repository';
export declare class TreeService {
    private readonly treeRepository;
    constructor(treeRepository: TreeRepository);
    create(treeProperties: any): Promise<any>;
    findAll(): string;
    findOne(id: number): Promise<import("./entities/tree.entity").Tree[]>;
    getTreeMembers(id: number): Promise<import("./entities/tree.entity").Tree[]>;
    getPartTreeByUserId(treeId: number, userId: string): Promise<import("./entities/tree.entity").Tree[]>;
    getTreeInPartsUserId(treeId: number, userId: string): Promise<import("./entities/tree.entity").Tree[]>;
    update(id: number, updateTreeDto: UpdateTreeDto): string;
    join(id: number, joinToTreeProperty: any): Promise<any>;
    remove(id: number): string;
}
