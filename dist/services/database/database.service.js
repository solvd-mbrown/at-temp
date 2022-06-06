"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const database_constants_1 = require("./database.constants");
const neo4j_driver_1 = require("neo4j-driver");
let DatabaseService = class DatabaseService {
    constructor(config, driver) {
        this.config = config;
        this.driver = driver;
    }
    getDriver() {
        return this.driver;
    }
    getConfig() {
        return this.driver;
    }
    getReadSession(database) {
        return this.driver.session({
            database: database || this.config.database,
            defaultAccessMode: neo4j_driver_1.default.session.READ,
        });
    }
    getWriteSession(database) {
        return this.driver.session({
            database: database || this.config.database,
            defaultAccessMode: neo4j_driver_1.default.session.WRITE,
        });
    }
    read(cypher, params, database) {
        const session = this.getReadSession(database);
        return session.run(cypher, params);
    }
    write(cypher, params, database) {
        const session = this.getWriteSession(database);
        return session.run(cypher, params);
    }
};
DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_DRIVER)),
    __param(1, (0, common_1.Inject)(database_constants_1.DATABASE_DRIVER)),
    __metadata("design:paramtypes", [Object, Object])
], DatabaseService);
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map