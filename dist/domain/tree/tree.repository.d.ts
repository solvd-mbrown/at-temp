import { Connection } from 'cypher-query-builder';
import { ConfigService } from '@nestjs/config';
import { Tree } from './entities/tree.entity';
export declare class TreeRepository {
    private readonly connection;
    private readonly configService;
    constructor(connection: Connection, configService: ConfigService);
    private query;
    addNewTree(treeData: any): Promise<Tree[]>;
    getTreeMembers(id: any): Promise<Tree[]>;
    getTree(id: any): Promise<Tree[]>;
    joinToTreeDescendant(id: any, treeProperties: any): Promise<any>;
    joinToTreeMarried(id: any, treeProperties: any): Promise<any>;
}
