import {Injectable} from "@nestjs/common";
import {CreateTreeDto} from "./dto/create-tree.dto";
import {UpdateTreeDto} from "./dto/update-tree.dto";
import {JoinToTreeDto} from "./dto/join-to-tree.dto";
import {TreeRepository} from "./tree.repository";
import {Tree} from "./entities/tree.entity";
import {TreeRelationType} from "./tree.constants";

@Injectable()
export class TreeService {
    private joinToTreeAncestorProperty: JoinToTreeDto;
    constructor(private readonly treeRepository: TreeRepository) {
    }

    async create(treeProperties: CreateTreeDto): Promise<Tree> {
        return await this.treeRepository.addNewTree(treeProperties);
    }

    findAll() {
        return `This action returns all tree`;
    }

    async findOne(id: number) {
        return await this.treeRepository.getTree(id);

    }

    async findOneByUUID(id: string) {
        return await this.treeRepository.getTreeByUUID(id);

    }

    async getTreeMembers(id: number) {
        return await this.treeRepository.getTreeMembers(id);

    }

    async getPartTreeByUserId(treeId: number, userId: number) {
        return await this.treeRepository.getPartTreeByUserId(
            treeId,
            userId
        );
    }

    async getTreeInPartsUserId(treeId: number, userId: string) {
        return await this.treeRepository.getTreeInPartsUserIdNew(
            treeId,
            userId
        );

    }

    async update(id: number, updateTreeDto: UpdateTreeDto) {
         return await this.treeRepository.updateTreeEntity(
            id,
            updateTreeDto
        );

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
        if (joinToTreeProperty.relation != "ANCESTOR") {
            result = await this.treeRepository.joinToTreeAncestor(
                id,
                this.joinToTreeAncestorProperty
            );
        }
        if (joinToTreeProperty.relation == "MARRIED-SUBTREE") {
            result = await this.treeRepository.joinToTreeMarriedSubTree(
                id,
                joinToTreeProperty
            );
        }
            return result;

        }


    async remove(id: number) {
        return await this.treeRepository.removeTree(id);

    }

    async removeUserFromTree(id: number) {
        return await this.treeRepository.removeUserFromTree(id);
    }
}
