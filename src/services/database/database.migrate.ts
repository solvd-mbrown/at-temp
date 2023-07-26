import { Driver } from 'neo4j-driver/types/driver';

/**
 * Gets migration status for a given app.
 * @param {*} driver neo4j bolt driver
 * @param {*} appName app to check migration status for
 * @param database database to run migrations on
 * @returns object with keys: app, migration.
 */
async function migrationStatus(driver, appName, database) {
  let migrationHistory;
  try {
    const session = driver.session({ database });
    migrationHistory = await session.run(
      'MATCH (m:__dm {app: $appName }) RETURN PROPERTIES(m) AS migration',
      { appName },
    );
    await session.close();
  } catch (err) {
    console.error(err);
  }

  return migrationHistory.records
    .map((record) => record.get('migration'))
    .sort((a, b) => a.migration.localeCompare(b.migration));
}

/**
 * Inserts a migration node into the DB
 * @param {*} driver neo4j bolt driver
 * @param {*} appName app to add migation node for
 * @param {*} migration the migration number
 * @param database database to run migrations on
 * @returns none
 */
async function forwardMigration(
  driver: Driver,
  appName: string,
  migration: number,
  database: string,
) {
  try {
    const session = driver.session({ database });
    await session.run(
      'CREATE (m:__dm {app: $appName, migration: $migration})',
      { appName, migration },
    );
    await session.close();
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Removes a migration node from the DB
 * @param {*} driver neo4j bolt driver
 * @param {*} appName app to add migation node for
 * @param {*} migration the migration number
 * @param database database to run migrations on
 * @returns none
 */
async function backwardMigration(
  driver: Driver,
  appName: string,
  migration: number,
  database: string,
) {
  try {
    const session = driver.session({ database });
    await session.run(
      'MATCH (m:__dm {app: $appName, migration: $migration}) DELETE m',
      { appName, migration },
    );
    await session.close();
  } catch (err) {
    throw new Error(err);
  }
}

export class Migrate {
  private driver: Driver | null = null;
  constructor(driver: Driver) {
    this.driver = driver;
  }

  public async close(): Promise<boolean> {
    try {
      await this.driver.close();
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }

  public destroy() {
    this.driver = null;
  }
}
