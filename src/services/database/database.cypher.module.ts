import { DATABASE_CONFIG, DATABASE_CONNECTION } from './database.constants';
import { DatabaseConfig } from './database.service';
import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';
import { Connection, DriverConstructor } from 'cypher-query-builder';
import { databaseConnectionUrl } from './database.driver';

export type DatabaseAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
  useFactory: (..._args: any[]) => Promise<DatabaseConfig>;
  inject?: any[];
};
export class ConnectionError extends Error {
  public details: any;
  constructor(oldError: Error) {
    super();
    this.message = 'Connection to the Neo4j Database was not established';
    this.name = 'Connection error';
    this.stack = oldError.stack;
    this.details = oldError.message;
  }
}
export type ConnectionWithDriver = Connection & {
  driver: DriverConstructor;
};

export const createProvider = async (
  config: DatabaseConfig,
): Promise<Connection> => {
  const connection = new Connection(databaseConnectionUrl(config), {
    username: config.username,
    password: config.password,
  }) as ConnectionWithDriver;
  try {
    await connection.driver.verifyConnectivity();
  } catch (error) {
    throw new ConnectionError(error);
  }
  return connection;
};

@Global()
@Module({})
export class DatabaseCypherModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    const provider = {
      provide: DATABASE_CONNECTION,
      useFactory: async (): Promise<Connection> => createProvider(config),
    };

    return {
      module: DatabaseCypherModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forRootAsync(asyncOptions: DatabaseAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: DATABASE_CONNECTION,
      useFactory: async (options: DatabaseConfig) => {
        return createProvider(options);
      },
      inject: [DATABASE_CONFIG],
    };

    return {
      module: DatabaseCypherModule,
      imports: asyncOptions.imports,
      providers: [
        {
          provide: DATABASE_CONFIG,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || [],
        },
        connectionProvider,
      ],
      exports: [connectionProvider],
    };
  }
}
