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
exports.CommentRepository = void 0;
const common_1 = require("@nestjs/common");
const cypher_query_builder_1 = require("cypher-query-builder");
const cypher = require("../../services/database/repository.utils");
const config_1 = require("@nestjs/config");
const database_constants_1 = require("../../services/database/database.constants");
const comment_constants_1 = require("./comment.constants");
const post_repository_1 = require("../post/post.repository");
let CommentRepository = class CommentRepository {
    constructor(connection, configService, postRepository) {
        this.connection = connection;
        this.configService = configService;
        this.postRepository = postRepository;
    }
    query() {
        return new cypher.RepositoryQuery(this.connection);
    }
    async addNewComment(commentData) {
        const result = await this.query()
            .createEntity('Comment', commentData)
            .commitWithReturnEntity();
        const entityForComment = await this.query()
            .findEntityById(commentData.commentForEntityType, commentData.commentForEntityId)
            .commitWithReturnEntity();
        let comments = [];
        if (commentData.commentForEntityType === comment_constants_1.ENTITY_TYPE_POST) {
            if (entityForComment.data.Post.properties.comments && entityForComment.data.Post.properties.comments.length) {
                comments = entityForComment.data.Post.properties.comments;
                comments.push(+result.data.Comment.identity);
            }
            else {
                comments = [+result.data.Comment.identity];
            }
            await this.postRepository.updatePostEntity(commentData.commentForEntityId, { "comments": comments });
        }
        if (commentData.commentForEntityType === comment_constants_1.ENTITY_TYPE_COMMENT) {
            if (entityForComment.data.Comment.properties.comments && entityForComment.data.Comment.properties.comments.length) {
                comments = entityForComment.data.Comment.properties.comments;
                comments.push(+result.data.Comment.identity);
            }
            else {
                comments = [+result.data.Comment.identity];
            }
            this.updateCommentEntity(commentData.commentForEntityId, { "comments": comments });
        }
        if (result) {
            const data = result.data;
            return Object.assign({ id: data.Comment.identity }, data.Comment.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async getCommentEntity(id) {
        const result = await this.query()
            .findEntityById('Comment', id)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return Object.assign({ id: data.Comment.identity }, data.Comment.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async getAllCommentsByIds(id, type) {
        const entityResult = await this.query()
            .findEntityById(type, id)
            .commitWithReturnEntity();
        let result = null;
        if (type === comment_constants_1.ENTITY_TYPE_COMMENT) {
            result = await this.query()
                .findEntityByIds('Comment', entityResult.data.Comment.properties.comments)
                .commitWithReturnEntities();
        }
        if (type === comment_constants_1.ENTITY_TYPE_POST) {
            result = await this.query()
                .findEntityByIds('Comment', entityResult.data.Post.properties.comments)
                .commitWithReturnEntities();
        }
        if (result) {
            return result.map(({ data }) => {
                const result = data;
                return Object.assign({ id: result.Comment.identity }, result.Comment.properties);
            });
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async deleteComment(id) {
        const result = await this.query()
            .deleteEntityById('Comment', id)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return {
                "response": "done"
            };
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async updateCommentEntity(commentId, commentParams) {
        const params = commentParams;
        const result = await this.query()
            .findEntityById('Comment', commentId)
            .updateEntity('Comment', Object.entries({
            'Comment.commentType': params === null || params === void 0 ? void 0 : params.commentType,
            'Comment.commentBody': params === null || params === void 0 ? void 0 : params.commentBody,
            'Comment.comments': params === null || params === void 0 ? void 0 : params.comments,
        }).reduce((valuesAcc, [key, value]) => {
            return value !== undefined && value !== null
                ? Object.assign(Object.assign({}, valuesAcc), { [key]: value }) : valuesAcc;
        }, {}))
            .commitWithReturnEntity();
        if (result !== null) {
            const data = result.data;
            return Object.assign({ id: data.Comment.identity }, data.Comment.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
};
CommentRepository = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [cypher_query_builder_1.Connection,
        config_1.ConfigService,
        post_repository_1.PostRepository])
], CommentRepository);
exports.CommentRepository = CommentRepository;
//# sourceMappingURL=comment.repository.js.map