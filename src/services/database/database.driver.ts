import neo4j from 'neo4j-driver';
import { DatabaseConfig } from './database.service';

export const databaseConnectionUrl = (config: DatabaseConfig) => {
  return `${config.schema}://${config.host}:${config.port}`;
};

export const createDriver = async (config: DatabaseConfig) => {
  // Create a Driver instance
  const driver = neo4j.driver(
    databaseConnectionUrl(config),
    neo4j.auth.basic(config.username, config.password),
  );
  // Verify the connection details or throw an Error
  await driver.verifyConnectivity();
  return driver;
};
