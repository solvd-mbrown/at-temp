import { DatabaseConfig } from './database.service';
import {
  DATABASE_DRIVER,
  DATABASE_CONFIG,
  DATABASE_CONNECTION,
} from './database.constants';
import { AppModule } from './../../app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import { createDriver } from './database.driver';
import { createDatabaseConfiguration } from './database.module';
import { createProvider } from './database.cypher.module';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        DatabaseService,
        {
          provide: DATABASE_CONFIG,
          inject: [ConfigService],
          useFactory: async (config: ConfigService) =>
            createDatabaseConfiguration(config),
        },
        {
          provide: DATABASE_DRIVER,
          inject: [DATABASE_CONFIG],
          useFactory: async (config: DatabaseConfig) => createDriver(config),
        },
        {
          provide: DATABASE_CONNECTION,
          useFactory: async (options: DatabaseConfig) => {
            return createProvider(options);
          },
          inject: [DATABASE_CONFIG],
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
