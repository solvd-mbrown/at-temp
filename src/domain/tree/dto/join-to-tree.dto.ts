import {ApiProperty} from "@nestjs/swagger";


export class JoinToTreeDto {

  @ApiProperty({ description: 'The ID of the tree to join' })
    treeId: number;

  @ApiProperty({ description: 'The ID of the user who wants to join the tree' })
  userId: number;

  @ApiProperty({ description: 'The name of the tree node' })
  name: string;

  @ApiProperty({ description: 'The Relationship of the tree node' })
  relation: any;

}