import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TreeService } from './tree.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { JoinToTreeDto } from './dto/join-to-tree.dto';

@Controller('tree')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @Post('add')
  create(@Body() createTreeDto: CreateTreeDto) {
    return this.treeService.create(createTreeDto);
  }

  @Get()
  findAll() {
    return this.treeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treeService.findOne(+id);
  } 
  
  @Get('members/:id')
  getTreeMembers(@Param('id') id: string) {
    return this.treeService.getTreeMembers(+id);
  }

  @Get('partTree/:treeId/:userId')
  getPartTreeByUserId(
    @Param('treeId') treeId: string,
    @Param('userId') userId: string,
  ) {
    return this.treeService.getPartTreeByUserId(+treeId, userId);
  }

  @Get('treeInParts/:treeId/:userId')
  getTreeInPartsUserId(
    @Param('treeId') treeId: string,
    @Param('userId') userId: string,
  ) {
    return this.treeService.getTreeInPartsUserId(+treeId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTreeDto: UpdateTreeDto) {
    return this.treeService.update(+id, updateTreeDto);
  }
 
  @Patch('jointo/:id')
  join(@Param('id') id: string, @Body() joinToTreeDto: JoinToTreeDto) {
    return this.treeService.join(+id, joinToTreeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treeService.remove(+id);
  }
}
