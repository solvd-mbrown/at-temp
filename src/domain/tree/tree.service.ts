import { Injectable } from "@nestjs/common";
import { CreateTreeDto } from "./dto/create-tree.dto";
import { UpdateTreeDto } from "./dto/update-tree.dto";
import { JoinToTreeDto } from "./dto/join-to-tree.dto";
import { TreeRepository } from "./tree.repository";
import { Tree } from "./entities/tree.entity";

@Injectable()
export class TreeService {
  constructor(private readonly treeRepository: TreeRepository) {}

  async create(treeProperties: CreateTreeDto): Promise<Tree> {
    const result = await this.treeRepository.addNewTree(treeProperties);
    return result;
  }

  findAll() {
    return `This action returns all tree`;
  }

  async findOne(id: number) {
    const result = await this.treeRepository.getTree(id);
    return result;
  }

  async findOneByUUID(id: string) {
    const result = await this.treeRepository.getTreeByUUID(id);
    return result;
  }

  async getTreeMembers(id: number) {
    const result = await this.treeRepository.getTreeMembers(id);
    return result;
  }

  async getPartTreeByUserId(treeId: number, userId: number) {
    const result = await this.treeRepository.getPartTreeByUserId(
      treeId,
      userId
    );
    return result;
  }

  async getTreeInPartsUserId(treeId: number, userId: string) {
    const result = await this.treeRepository.getTreeInPartsUserIdNew(
      treeId,
      userId
    );
    return result;
  }

  async update(id: number, updateTreeDto: UpdateTreeDto) {
    const result = await this.treeRepository.updateTreeEntity(
      id,
      updateTreeDto
    );
    return result;
  }

  async join(id: number, joinToTreeProperty: JoinToTreeDto) {
    let result = null;
    if (joinToTreeProperty.relation == "MARRIED") {
      result = await this.treeRepository.joinToTreeMarried(
        id,
        joinToTreeProperty
      );
    }
    if (joinToTreeProperty.relation == "DESCENDANT") {
      result = await this.treeRepository.joinToTreeDescendant(
        id,
        joinToTreeProperty
      );
    }
    if (joinToTreeProperty.relation == "MARRIEDSUBTREE") {
      result = await this.treeRepository.joinToTreeMarriedSubTree(
        id,
        joinToTreeProperty
      );
    }
    return result;
  }

  async remove(id: number) {
    const result = await this.treeRepository.removeTree(id);
    return result;
  }

  async removeUserFromTree(id: number) {
    const result = await this.treeRepository.removeUserFromTree(id);
    return result;
  }
}
