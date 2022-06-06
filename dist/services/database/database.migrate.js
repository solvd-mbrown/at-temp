"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrate = void 0;
async function migrationStatus(driver, appName, database) {
    let migrationHistory;
    try {
        const session = driver.session({ database });
        migrationHistory = await session.run('MATCH (m:__dm {app: $appName }) RETURN PROPERTIES(m) AS migration', { appName });
        await session.close();
    }
    catch (err) {
        console.error(err);
    }
    return migrationHistory.records
        .map((record) => record.get('migration'))
        .sort((a, b) => a.migration.localeCompare(b.migration));
}
async function forwardMigration(driver, appName, migration, database) {
    try {
        const session = driver.session({ database });
        await session.run('CREATE (m:__dm {app: $appName, migration: $migration})', { appName, migration });
        await session.close();
    }
    catch (err) {
        throw new Error(err);
    }
}
async function backwardMigration(driver, appName, migration, database) {
    try {
        const session = driver.session({ database });
        await session.run('MATCH (m:__dm {app: $appName, migration: $migration}) DELETE m', { appName, migration });
        await session.close();
    }
    catch (err) {
        throw new Error(err);
    }
}
class Migrate {
    constructor(driver) {
        this.driver = null;
        this.driver = driver;
    }
    async close() {
        try {
            await this.driver.close();
            return true;
        }
        catch (e) {
            throw new Error(e);
        }
    }
    destroy() {
        this.driver = null;
    }
}
exports.Migrate = Migrate;
//# sourceMappingURL=database.migrate.js.map