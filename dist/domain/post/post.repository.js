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
exports.PostRepository = void 0;
const common_1 = require("@nestjs/common");
const cypher_query_builder_1 = require("cypher-query-builder");
const cypher = require("../../services/database/repository.utils");
const config_1 = require("@nestjs/config");
const database_constants_1 = require("../../services/database/database.constants");
const utils_repository_1 = require("../../utils/utils.repository");
let PostRepository = class PostRepository {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
    }
    query() {
        return new cypher.RepositoryQuery(this.connection);
    }
    async getPostEntity(id) {
        const result = await this.query()
            .findEntityById('Post', id)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return Object.assign({ id: data.Post.identity }, data.Post.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async getAllPostsByTreeUUID(uuid) {
        const treeUUID = utils_repository_1.UtilsRepository.getStringVersion(uuid);
        const result = await this.query()
            .fetchAllByEntityUUUID(treeUUID, 'Post')
            .commitWithReturnEntities();
        if (result) {
            return result.map(({ data }) => {
                const result = data;
                return Object.assign({ id: result.Post.identity }, result.Post.properties);
            });
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async findAllByUserId(id) {
        const result = await this.query()
            .findAllPostsByUserId(id, 'Post')
            .commitWithReturnEntities();
        if (result) {
            return result.map(({ data }) => {
                const result = data;
                return Object.assign({ id: result.Post.identity }, result.Post.properties);
            });
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async addNewPost(postData) {
        postData.postBody = utils_repository_1.UtilsRepository.getStringVersion(postData === null || postData === void 0 ? void 0 : postData.postBody);
        const result = await this.query()
            .createEntity('Post', postData)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return Object.assign({ id: data.Post.identity }, data.Post.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async deletePost(id) {
        const result = await this.query()
            .deleteEntityById('Post', id)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return {
                "response": "done"
            };
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async updatePostEntity(postId, postParams) {
        const params = postParams;
        const result = await this.query()
            .findEntityById('Post', postId)
            .updateEntity('Post', Object.entries({
            'Post.postType': params === null || params === void 0 ? void 0 : params.postType,
            'Post.postBody': (params === null || params === void 0 ? void 0 : params.postBody) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.postBody) : null,
            'Post.comments': params === null || params === void 0 ? void 0 : params.comments,
        }).reduce((valuesAcc, [key, value]) => {
            return value !== undefined && value !== null
                ? Object.assign(Object.assign({}, valuesAcc), { [key]: value }) : valuesAcc;
        }, {}))
            .commitWithReturnEntity();
        if (result !== null) {
            const data = result.data;
            return Object.assign({ id: data.Post.identity }, data.Post.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
};
PostRepository = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [cypher_query_builder_1.Connection,
        config_1.ConfigService])
], PostRepository);
exports.PostRepository = PostRepository;
//# sourceMappingURL=post.repository.js.map