"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseCypherModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseCypherModule = exports.createProvider = exports.ConnectionError = void 0;
const database_constants_1 = require("./database.constants");
const common_1 = require("@nestjs/common");
const cypher_query_builder_1 = require("cypher-query-builder");
const database_driver_1 = require("./database.driver");
class ConnectionError extends Error {
    constructor(oldError) {
        super();
        this.message = 'Connection to the Neo4j Database was not established';
        this.name = 'Connection error';
        this.stack = oldError.stack;
        this.details = oldError.message;
    }
}
exports.ConnectionError = ConnectionError;
const createProvider = async (config) => {
    const connection = new cypher_query_builder_1.Connection((0, database_driver_1.databaseConnectionUrl)(config), {
        username: config.username,
        password: config.password,
    });
    try {
        await connection.driver.verifyConnectivity();
    }
    catch (error) {
        throw new ConnectionError(error);
    }
    return connection;
};
exports.createProvider = createProvider;
let DatabaseCypherModule = DatabaseCypherModule_1 = class DatabaseCypherModule {
    static forRoot(config) {
        const provider = {
            provide: database_constants_1.DATABASE_CONNECTION,
            useFactory: async () => (0, exports.createProvider)(config),
        };
        return {
            module: DatabaseCypherModule_1,
            providers: [provider],
            exports: [provider],
        };
    }
    static forRootAsync(asyncOptions) {
        const connectionProvider = {
            provide: database_constants_1.DATABASE_CONNECTION,
            useFactory: async (options) => {
                return (0, exports.createProvider)(options);
            },
            inject: [database_constants_1.DATABASE_CONFIG],
        };
        return {
            module: DatabaseCypherModule_1,
            imports: asyncOptions.imports,
            providers: [
                {
                    provide: database_constants_1.DATABASE_CONFIG,
                    useFactory: asyncOptions.useFactory,
                    inject: asyncOptions.inject || [],
                },
                connectionProvider,
            ],
            exports: [connectionProvider],
        };
    }
};
DatabaseCypherModule = DatabaseCypherModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], DatabaseCypherModule);
exports.DatabaseCypherModule = DatabaseCypherModule;
//# sourceMappingURL=database.cypher.module.js.map