import { Connection } from 'cypher-query-builder';
import { ConfigService } from '@nestjs/config';
import { User } from './users.constants';
export declare class UsersRepository {
    private readonly connection;
    private readonly configService;
    constructor(connection: Connection, configService: ConfigService);
    private query;
    addNewUser(toSetProperties?: {
        [key in keyof Partial<User>]: any;
    }[]): Promise<User[]>;
}
