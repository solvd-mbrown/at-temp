import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './database.service';
import { DynamicModule } from '@nestjs/common';
export declare function createDatabaseConfiguration(configService: ConfigService): DatabaseConfig;
export declare class DatabaseModule {
    static forRoot(config: DatabaseConfig): DynamicModule;
    static forRootAsync(configProvider: any): Promise<DynamicModule>;
}
