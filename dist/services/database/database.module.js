"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.createDatabaseConfiguration = void 0;
const database_constants_1 = require("./database.constants");
const common_1 = require("@nestjs/common");
const database_driver_1 = require("./database.driver");
const database_service_1 = require("./database.service");
function createDatabaseConfiguration(configService) {
    if (configService) {
        return {
            schema: configService.get('DATABASE_SCHEMA'),
            host: configService.get('DATABASE_HOST'),
            port: configService.get('DATABASE_PORT'),
            username: configService.get('DATABASE_USERNAME'),
            password: configService.get('DATABASE_PASSWORD'),
        };
    }
    else {
        return {
            schema: 'bolt',
            host: 'localhost',
            port: 11005,
            username: 'neo4j',
            password: 'pass',
        };
    }
}
exports.createDatabaseConfiguration = createDatabaseConfiguration;
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static forRoot(config) {
        return {
            module: DatabaseModule_1,
            providers: [
                {
                    provide: database_constants_1.DATABASE_CONFIG,
                    useValue: config,
                },
                {
                    provide: database_constants_1.DATABASE_DRIVER,
                    inject: [database_constants_1.DATABASE_CONFIG],
                    useFactory: async (config) => (0, database_driver_1.createDriver)(config),
                },
                database_service_1.DatabaseService,
            ],
            exports: [database_service_1.DatabaseService],
        };
    }
    static async forRootAsync(configProvider) {
        return {
            module: DatabaseModule_1,
            providers: [
                Object.assign({ provide: database_constants_1.DATABASE_CONFIG }, configProvider),
                {
                    provide: database_constants_1.DATABASE_DRIVER,
                    inject: [database_constants_1.DATABASE_CONFIG],
                    useFactory: async (config) => (0, database_driver_1.createDriver)(config),
                },
                database_service_1.DatabaseService,
            ],
            exports: [database_service_1.DatabaseService],
        };
    }
};
DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({})
], DatabaseModule);
exports.DatabaseModule = DatabaseModule;
//# sourceMappingURL=database.module.js.map