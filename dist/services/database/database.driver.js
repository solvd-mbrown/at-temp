"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDriver = exports.databaseConnectionUrl = void 0;
const neo4j_driver_1 = require("neo4j-driver");
const databaseConnectionUrl = (config) => {
    return `${config.schema}://${config.host}:${config.port}`;
};
exports.databaseConnectionUrl = databaseConnectionUrl;
const createDriver = async (config) => {
    const driver = neo4j_driver_1.default.driver((0, exports.databaseConnectionUrl)(config), neo4j_driver_1.default.auth.basic(config.username, config.password));
    await driver.verifyConnectivity();
    return driver;
};
exports.createDriver = createDriver;
//# sourceMappingURL=database.driver.js.map