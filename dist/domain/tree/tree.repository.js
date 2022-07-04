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
exports.TreeRepository = void 0;
const common_1 = require("@nestjs/common");
const cypher_query_builder_1 = require("cypher-query-builder");
const cypher = require("../../services/database/repository.utils");
const config_1 = require("@nestjs/config");
const database_constants_1 = require("../../services/database/database.constants");
let TreeRepository = class TreeRepository {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
    }
    query() {
        return new cypher.RepositoryQuery(this.connection);
    }
    async addNewTree(treeData) {
        const result = await this.query()
            .createEntity('Tree', { name: treeData.name }, true)
            .commitWithReturnEntity();
        await this.query()
            .createMemberRelation(treeData.userId, result.data.Tree.identity)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return Object.assign({ id: data.Tree.identity }, data.Tree.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async getTreeMembers(id) {
        const result = await this.query()
            .fetchAllByEntityId(id, 'Tree')
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return Object.assign(Object.assign({ id: data.Tree.identity }, data.Tree.properties), { treeMembers: data.nList });
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async getTree(id) {
        const result = await this.query()
            .fetchAllByEntityId(id, 'Tree')
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            const tree = cypher.buildTree(data);
            return Object.assign(Object.assign({ id: data.Tree.identity }, data.Tree.properties), { tree: tree[0] });
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async joinToTreeDescendant(id, treeProperties) {
        const result = await this.query()
            .createMemberAndDescendantRelations(treeProperties.userId, treeProperties.toUserId, id)
            .commitWithReturnEntity();
        if (result) {
            const output = result.data;
            return {
                "response": "done"
            };
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async joinToTreeMarried(id, treeProperties) {
        const result = await this.query()
            .createMemberAndMarriedRelations(treeProperties.userId, treeProperties.toUserId, id)
            .commitWithReturnEntity();
        if (result) {
            const output = result.data;
            return {
                "response": "done"
            };
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
};
TreeRepository = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [cypher_query_builder_1.Connection,
        config_1.ConfigService])
], TreeRepository);
exports.TreeRepository = TreeRepository;
//# sourceMappingURL=tree.repository.js.map