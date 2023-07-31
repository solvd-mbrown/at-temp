import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TreeService } from './tree.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { JoinToTreeDto } from './dto/join-to-tree.dto';
import {ApiTags} from "@nestjs/swagger";


@ApiTags('tree')
@Controller('tree')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @Get("all/:id")
  findOneByUUID(@Param("id") id: string) {
    return this.treeService.findOneByUUID(id);
  }

  @Get("members/:id")
  getTreeMembers(@Param("id") id: string) {
    return this.treeService.getTreeMembers(+id);
  }
  @Post()
  async create(@Body() createTreeDto: CreateTreeDto) {
    const result = await this.treeService.create(createTreeDto);
    return { data: result };
  }

  @Get()
  async findAll() {
    const result = this.treeService.findAll();
    return { data: result };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.treeService.findOne(+id);
    return { data: result };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTreeDto: UpdateTreeDto) {
    const result = await this.treeService.update(+id, updateTreeDto);
    return { data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.treeService.remove(+id);
    return { data: result };
  }

  @Delete("user/:id")
  removeUserFromTree(@Param("id") id: string) {
    return this.treeService.removeUserFromTree(+id);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, joinToTreeDto: JoinToTreeDto) {
    const result = await this.treeService.join(+id, joinToTreeDto);
    return { data: result };
  }
}
