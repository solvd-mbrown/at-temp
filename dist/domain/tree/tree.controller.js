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
exports.TreeController = void 0;
const common_1 = require("@nestjs/common");
const tree_service_1 = require("./tree.service");
const create_tree_dto_1 = require("./dto/create-tree.dto");
const update_tree_dto_1 = require("./dto/update-tree.dto");
const join_to_tree_dto_1 = require("./dto/join-to-tree.dto");
let TreeController = class TreeController {
    constructor(treeService) {
        this.treeService = treeService;
    }
    create(createTreeDto) {
        return this.treeService.create(createTreeDto);
    }
    findAll() {
        return this.treeService.findAll();
    }
    findOne(id) {
        return this.treeService.findOne(+id);
    }
    getTreeMembers(id) {
        return this.treeService.getTreeMembers(+id);
    }
    getPartTreeByUserId(treeId, userId) {
        return this.treeService.getPartTreeByUserId(+treeId, userId);
    }
    update(id, updateTreeDto) {
        return this.treeService.update(+id, updateTreeDto);
    }
    join(id, joinToTreeDto) {
        return this.treeService.join(+id, joinToTreeDto);
    }
    remove(id) {
        return this.treeService.remove(+id);
    }
};
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tree_dto_1.CreateTreeDto]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('members/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "getTreeMembers", null);
__decorate([
    (0, common_1.Get)('partTree/:treeId/:userId'),
    __param(0, (0, common_1.Param)('treeId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "getPartTreeByUserId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tree_dto_1.UpdateTreeDto]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('jointo/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, join_to_tree_dto_1.JoinToTreeDto]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "join", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TreeController.prototype, "remove", null);
TreeController = __decorate([
    (0, common_1.Controller)('tree'),
    __metadata("design:paramtypes", [tree_service_1.TreeService])
], TreeController);
exports.TreeController = TreeController;
//# sourceMappingURL=tree.controller.js.map