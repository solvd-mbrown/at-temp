import { DatabaseConfig } from './database.service';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Connection, DriverConstructor } from 'cypher-query-builder';
export declare type DatabaseAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (..._args: any[]) => Promise<DatabaseConfig>;
    inject?: any[];
};
export declare class ConnectionError extends Error {
    details: any;
    constructor(oldError: Error);
}
export declare type ConnectionWithDriver = Connection & {
    driver: DriverConstructor;
};
export declare const createProvider: (config: DatabaseConfig) => Promise<Connection>;
export declare class DatabaseCypherModule {
    static forRoot(config: DatabaseConfig): DynamicModule;
    static forRootAsync(asyncOptions: DatabaseAsyncOptions): DynamicModule;
}
