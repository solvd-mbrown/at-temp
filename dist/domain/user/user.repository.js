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
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const cypher_query_builder_1 = require("cypher-query-builder");
const cypher = require("../../services/database/repository.utils");
const config_1 = require("@nestjs/config");
const database_constants_1 = require("../../services/database/database.constants");
const utils_repository_1 = require("../../utils/utils.repository");
let UserRepository = class UserRepository {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
    }
    query() {
        return new cypher.RepositoryQuery(this.connection);
    }
    async addNewUser(userData) {
        const result = await this.query()
            .createEntity('User', userData)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return Object.assign({ id: data.User.identity }, data.User.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async deleteUser(id) {
        const result = await this.query()
            .deleteEntityById('User', id)
            .commitWithReturnEntity();
        if (result) {
            const data = result.data;
            return {
                "response": "done"
            };
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async getUserEntity(id) {
        const result = await this.query()
            .fetchUserByUserId(id)
            .commitWithReturnEntity();
        const parent = await this.query()
            .fetchUserByUserId(id)
            .resolveUsersParentsByRelation()
            .commitWithReturnEntities();
        let parents = [];
        if (parent && parent.length && parent[0].data.UserP) {
            parents.push(parent[0].data.UserP);
            if (parent[0].data.UserM) {
                parents.push(parent[0].data.UserM);
            }
        }
        const spouses = await this.query()
            .fetchUserByUserId(id)
            .resolveUsersSpouseByRelation()
            .commitWithReturnEntities();
        let spouse = [];
        if (spouses && spouses.length && spouses[0].data.UserS) {
            spouse.push(spouses[0].data.UserS);
        }
        let siblings = [];
        if (parent && parent.length && parent[0].data.UserP) {
            const siblingsArr = await this.query()
                .fetchUserByUserId(parent[0].data.UserP.identity)
                .resolveUsersChildrenByRelation()
                .commitWithReturnEntities();
            if (siblingsArr && siblingsArr.length && siblingsArr[0].data.UserKList) {
                let famalyLine = siblingsArr[0].data.UserKList;
                if (famalyLine.length > 1) {
                    famalyLine = famalyLine.filter(object => {
                        return object.identity != id;
                    });
                    siblings = famalyLine;
                }
            }
        }
        const childrens = await this.query()
            .fetchUserByUserId(id)
            .resolveUsersChildrenByRelation()
            .commitWithReturnEntities();
        let kids = [];
        if (childrens && childrens.length && childrens[0].data.UserKList) {
            kids = childrens[0].data.UserKList;
        }
        if (!childrens[0].data.UserKList.length && spouses && spouses[0].data.UserS) {
            const spouseChildrens = await this.query()
                .fetchUserByUserId(spouses[0].data.UserS.identity)
                .resolveUsersChildrenByRelation()
                .commitWithReturnEntities();
            if (spouseChildrens && spouseChildrens.length && spouseChildrens[0].data.UserKList) {
                kids = spouseChildrens[0].data.UserKList;
            }
        }
        if (result) {
            const data = result.data;
            data.User.properties.parents = parents.length ? parents : null;
            data.User.properties.siblings = siblings.length ? siblings : null;
            data.User.properties.spouse = spouse.length ? spouse : null;
            data.User.properties.kids = kids.length ? kids : null;
            return Object.assign({ id: data.User.identity }, data.User.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
    async updateUserEntity(userId, userParams) {
        const params = userParams;
        const result = await this.query()
            .fetchUserByUserId(userId)
            .updateEntity('User', Object.entries({
            'User.userPictureLink': params === null || params === void 0 ? void 0 : params.userPictureLink,
            'User.userPictureKey': params === null || params === void 0 ? void 0 : params.userPictureKey,
            'User.firstName': params === null || params === void 0 ? void 0 : params.firstName,
            'User.middleName': params === null || params === void 0 ? void 0 : params.middleName,
            'User.lastName': params === null || params === void 0 ? void 0 : params.lastName,
            'User.introduction': (params === null || params === void 0 ? void 0 : params.introduction) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.introduction) : null,
            'User.birthdate': params === null || params === void 0 ? void 0 : params.birthdate,
            'User.dateOfDeath': params === null || params === void 0 ? void 0 : params.dateOfDeath,
            'User.deceased': params === null || params === void 0 ? void 0 : params.deceased,
            'User.gender': params === null || params === void 0 ? void 0 : params.gender,
            'User.hometown': params === null || params === void 0 ? void 0 : params.hometown,
            'User.homeCountry': params === null || params === void 0 ? void 0 : params.homeCountry,
            'User.email': params === null || params === void 0 ? void 0 : params.email,
            'User.phone': params === null || params === void 0 ? void 0 : params.phone,
            'User.address': params === null || params === void 0 ? void 0 : params.address,
            'User.spouseTreeId': params === null || params === void 0 ? void 0 : params.spouseTreeId,
            'User.myTreeId': params === null || params === void 0 ? void 0 : params.myTreeId,
            'User.spouse': (params === null || params === void 0 ? void 0 : params.spouse) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.spouse) : null,
            'User.kids': (params === null || params === void 0 ? void 0 : params.kids) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.kids) : null,
            'User.parents': (params === null || params === void 0 ? void 0 : params.parents) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.parents) : null,
            'User.siblings': (params === null || params === void 0 ? void 0 : params.siblings) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.siblings) : null,
            'User.socialNetworks': (params === null || params === void 0 ? void 0 : params.socialNetworks) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.socialNetworks) : null,
            'User.work': (params === null || params === void 0 ? void 0 : params.work) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.work) : null,
            'User.education': (params === null || params === void 0 ? void 0 : params.education) ? utils_repository_1.UtilsRepository.getStringVersion(params === null || params === void 0 ? void 0 : params.education) : null,
        }).reduce((valuesAcc, [key, value]) => {
            return value !== undefined && value !== null
                ? Object.assign(Object.assign({}, valuesAcc), { [key]: value }) : valuesAcc;
        }, {}))
            .commitWithReturnEntity();
        if (result !== null) {
            const data = result.data;
            return Object.assign({ id: data.User.identity }, data.User.properties);
        }
        throw new common_1.BadRequestException(database_constants_1.CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }
};
UserRepository = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(database_constants_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [cypher_query_builder_1.Connection,
        config_1.ConfigService])
], UserRepository);
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map