import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_DRIVER } from './database.constants';
import neo4j, { Driver, Result, Session } from 'neo4j-driver';

export type DatabaseSchema =
  | 'neo4j'
  | 'neo4j+s'
  | 'neo4j+scc'
  | 'bolt'
  | 'bolt+s'
  | 'bolt+scc';

export interface DatabaseConfig {
  schema: DatabaseSchema;
  host: string;
  port: number | string;
  username: string;
  password: string;
  database?: string;
}

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE_DRIVER) private readonly config: DatabaseConfig,
    @Inject(DATABASE_DRIVER) private readonly driver,
  ) {}

  getDriver(): Driver {
    return this.driver;
  }

  getConfig(): DatabaseConfig {
    return this.driver;
  }

  /**
   * @TODO Replace Input Session Object with SessionConfig
   */
  getReadSession(database?: string): Session {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.READ,
    });
  }
  getWriteSession(database?: string): Session {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: neo4j.session.WRITE,
    });
  }

  read(cypher: string, params: Record<string, any>, database?: string): Result {
    const session = this.getReadSession(database);
    return session.run(cypher, params);
  }

  write(
    cypher: string,
    params: Record<string, any>,
    database?: string,
  ): Result {
    const session = this.getWriteSession(database);
    return session.run(cypher, params);
  }
}
