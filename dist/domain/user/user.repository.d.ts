import { Connection } from 'cypher-query-builder';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
export declare class UserRepository {
    private readonly connection;
    private readonly configService;
    constructor(connection: Connection, configService: ConfigService);
    private query;
    addNewUser(userData: any): Promise<User[]>;
    deleteUser(id: number): Promise<any>;
    getUserEntity(id: number): Promise<any>;
    updateUserEntity(userId: any, userParams: any): Promise<any>;
}
