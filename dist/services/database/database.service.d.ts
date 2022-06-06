import { Driver, Result, Session } from 'neo4j-driver';
export declare type DatabaseSchema = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc';
export interface DatabaseConfig {
    schema: DatabaseSchema;
    host: string;
    port: number | string;
    username: string;
    password: string;
    database?: string;
}
export declare class DatabaseService {
    private readonly config;
    private readonly driver;
    constructor(config: DatabaseConfig, driver: any);
    getDriver(): Driver;
    getConfig(): DatabaseConfig;
    getReadSession(database?: string): Session;
    getWriteSession(database?: string): Session;
    read(cypher: string, params: Record<string, any>, database?: string): Result;
    write(cypher: string, params: Record<string, any>, database?: string): Result;
}
