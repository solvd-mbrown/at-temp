import { ConfigService } from '@nestjs/config';
import { DATABASE_CONFIG, DATABASE_DRIVER } from './database.constants';
import { DatabaseConfig } from './database.service';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { createDriver } from './database.driver'; // Reference for Neo4j Driver
import { DatabaseService } from './database.service';

export function createDatabaseConfiguration(
  configService: ConfigService,
): DatabaseConfig {
  if (configService) {
    return {
      schema: configService.get('DATABASE_SCHEMA'),
      host: configService.get('DATABASE_HOST'),
      port: configService.get('DATABASE_PORT'),
      username: configService.get('DATABASE_USERNAME'),
      password: configService.get('DATABASE_PASSWORD'),
    };
  } else {
    return {
      schema: 'bolt',
      host: 'localhost',
      port: 11005,
      username: 'neo4j',
      password: 'pass',
    };
  }
}

@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_CONFIG,
          useValue: config,
        },
        {
          // Define a key for injection
          provide: DATABASE_DRIVER,
          inject: [DATABASE_CONFIG],
          useFactory: async (config: DatabaseConfig) => createDriver(config),
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
  static async forRootAsync(configProvider): Promise<DynamicModule> {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_CONFIG,
          ...configProvider,
        } as Provider<any>,
        {
          provide: DATABASE_DRIVER,
          inject: [DATABASE_CONFIG],
          useFactory: async (config: DatabaseConfig) => createDriver(config),
        },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
