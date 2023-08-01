import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TreeService } from './tree.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { JoinToTreeDto } from './dto/join-to-tree.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';

class Tree {
  @ApiProperty({ description: 'The ID of the tree' })
  id: number;

  @ApiProperty({ description: 'The name of the tree' })
  name: string;

  @ApiProperty({ description: 'The ID of the user who created the tree' })
  userId: number;
}

@ApiTags('tree')
@Controller('tree')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @ApiOperation({ summary: 'Get a tree by its UUID' })
  @ApiParam({ name: 'id', description: 'UUID of the tree' })
  @ApiResponse({ status: 200, description: 'The tree with the matching UUID', type: Tree })
  @Get('all/:id')
  findOneByUUID(@Param('id') id: string) {
    return this.treeService.findOneByUUID(id);
  }

  @ApiOperation({ summary: 'Get members of a specific tree' })
  @ApiParam({ name: 'id', description: 'ID of the tree' })
  @ApiResponse({ status: 200, description: 'Members of the tree', type: [Tree] })
  @Get('members/:id')
  getTreeMembers(@Param('id') id: string) {
    return this.treeService.getTreeMembers(+id);
  }

  @ApiOperation({ summary: 'Create a new tree' })
  @ApiBody({ type: CreateTreeDto })
  @ApiResponse({ status: 201, description: 'The created tree', type: Tree })
  @Post('add')
  async create(@Body() createTreeDto: CreateTreeDto) {
    const result = await this.treeService.create(createTreeDto);
    return { data: result };
  }

  @ApiOperation({ summary: 'Get all trees' })
  @ApiResponse({ status: 200, description: 'List of all trees', type: [Tree] })
  @Get()
  async findAll() {
    const result = this.treeService.findAll();
    return { data: result };
  }

  @ApiOperation({ summary: 'Get a specific tree' })
  @ApiParam({ name: 'id', description: 'ID of the tree' })
  @ApiResponse({ status: 200, description: 'The tree with the matching ID', type: Tree })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.treeService.findOne(+id);
    return { data: result };
  }

  @ApiOperation({ summary: 'Update a specific tree' })
  @ApiParam({ name: 'id', description: 'ID of the tree' })
  @ApiBody({ type: UpdateTreeDto })
  @ApiResponse({ status: 200, description: 'The updated tree', type: Tree })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTreeDto: UpdateTreeDto) {
    const result = await this.treeService.update(+id, updateTreeDto);
    return { data: result };
  }

  @ApiOperation({ summary: 'Delete a specific tree' })
  @ApiParam({ name: 'id', description: 'ID of the tree' })
  @ApiResponse({ status: 204, description: 'The tree has been deleted' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.treeService.remove(+id);
    return { data: result };
  }

  @ApiOperation({ summary: 'Remove a user from a specific tree' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 204, description: 'The user has been removed from the tree' })
  @Delete('user/:id')
  removeUserFromTree(@Param('id') id: string) {
    return this.treeService.removeUserFromTree(+id);
  }

  @ApiOperation({ summary: 'Join a user to a specific tree' })
  @ApiParam({ name: 'id', description: 'ID of the tree' })
  @ApiBody({ type: JoinToTreeDto })
  @ApiResponse({ status: 200, description: 'The user has joined the tree', type: Tree })
  @Post(':id/join')
  async join(@Param('id') id: string, @Body() joinToTreeDto: JoinToTreeDto) {
    const result = await this.treeService.join(+id, joinToTreeDto);
    return { data: result };
  }
}
