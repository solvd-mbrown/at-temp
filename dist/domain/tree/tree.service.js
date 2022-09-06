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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeService = void 0;
const common_1 = require("@nestjs/common");
const tree_repository_1 = require("./tree.repository");
let TreeService = class TreeService {
    constructor(treeRepository) {
        this.treeRepository = treeRepository;
    }
    async create(treeProperties) {
        const result = await this.treeRepository.addNewTree(treeProperties);
        return result;
    }
    findAll() {
        return `This action returns all tree`;
    }
    async findOne(id) {
        const result = await this.treeRepository.getTree(id);
        return result;
    }
    async getTreeMembers(id) {
        const result = await this.treeRepository.getTreeMembers(id);
        return result;
    }
    async getPartTreeByUserId(treeId, userId) {
        const result = await this.treeRepository.getPartTreeByUserId(treeId, userId);
        return result;
    }
    async getTreeInPartsUserId(treeId, userId) {
        const result = await this.treeRepository.getTreeInPartsUserId(treeId, userId);
        return result;
    }
    update(id, updateTreeDto) {
        return `This action updates a #${id} tree`;
    }
    async join(id, joinToTreeProperty) {
        let result = null;
        if (joinToTreeProperty.relation == 'MARRIED') {
            result = await this.treeRepository.joinToTreeMarried(id, joinToTreeProperty);
        }
        if (joinToTreeProperty.relation == 'DESCENDANT') {
            result = await this.treeRepository.joinToTreeDescendant(id, joinToTreeProperty);
        }
        if (joinToTreeProperty.relation == 'MARRIEDSUBTREE') {
            result = await this.treeRepository.joinToTreeMarriedSubTree(id, joinToTreeProperty);
        }
        return result;
    }
    remove(id) {
        return `This action removes a #${id} tree`;
    }
};
TreeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tree_repository_1.TreeRepository])
], TreeService);
exports.TreeService = TreeService;
//# sourceMappingURL=tree.service.js.map