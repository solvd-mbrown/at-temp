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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const cypher_query_builder_1 = require("cypher-query-builder");
const cypher = require("../../services/database/repository.utils");
const config_1 = require("@nestjs/config");
const database_constants_1 = require("../../services/database/database.constants");
let UsersRepository = class UsersRepository {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
    }
    query() {
        return new cypher.RepositoryQuery(this.connection);
    }
    async addNewUser(toSetProperties) {
        const results = await Promise.all(toSetProperties.map((property) => this.query()
            .createNode('User')
            .setPropertyOnEntity('User', property)
            .addDependencies(['User'], true)
            .commitWithReturnEntity()));
        return ((results === null || results === void 0 ? void 0 : results.map(({ data }) => {
            const { User: { identity: id, properties }, } = data;
            return Object.assign({ id }, properties);
        })) || null);
    }
};
UsersRepository = __decorate([
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [cypher_query_builder_1.Connection,
        config_1.ConfigService])
], UsersRepository);
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=users.repository.js.map