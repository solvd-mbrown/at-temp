import { Injectable } from '@nestjs/common';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { JoinToTreeDto } from './dto/join-to-tree.dto';
import { TreeRepository } from './tree.repository';

@Injectable()
export class TreeService {
  constructor(
    private readonly treeRepository: TreeRepository,
  ) {}
  
  async create(treeProperties): Promise<any> {
    const result = await this.treeRepository.addNewTree(treeProperties);
    return result;
  }

  findAll() {

    return `This action returns all tree`;
  }

  async findOne(id: number) {
    const result = await this.treeRepository.getTree(id);
    return result;
    return `This action returns a #${id} tree`;
  }

  update(id: number, updateTreeDto: UpdateTreeDto) {
    return `This action updates a #${id} tree`;
  }

  async join(id: number, joinToTreeProperty) {
    let result = null;
    if (joinToTreeProperty.relation == 'MARRIED') {
      result = await this.treeRepository.joinToTreeMarried(id, joinToTreeProperty);
    } else{
      result = await this.treeRepository.joinToTreeDescendant(id, joinToTreeProperty);
    }
    return result;
  }

  remove(id: number) {
    return `This action removes a #${id} tree`;
  }
}
