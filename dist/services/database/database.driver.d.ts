import { DatabaseConfig } from './database.service';
export declare const databaseConnectionUrl: (config: DatabaseConfig) => string;
export declare const createDriver: (config: DatabaseConfig) => Promise<import("neo4j-driver/types/driver").Driver>;
