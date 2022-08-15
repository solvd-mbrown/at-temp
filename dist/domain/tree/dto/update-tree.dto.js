"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTreeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tree_dto_1 = require("./create-tree.dto");
class UpdateTreeDto extends (0, mapped_types_1.PartialType)(create_tree_dto_1.CreateTreeDto) {
}
exports.UpdateTreeDto = UpdateTreeDto;
//# sourceMappingURL=update-tree.dto.js.map