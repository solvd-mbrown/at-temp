import { PartialType } from '@nestjs/mapped-types';
import { CreateTreeDto } from './create-tree.dto';
import {ApiProperty} from "@nestjs/swagger";

export class UpdateTreeDto extends PartialType(CreateTreeDto) {
    @ApiProperty({ description: 'The name of the tree' })
  name: string;

  @ApiProperty({ description: 'The ID of the user who created the tree' })
  userId: number;
}
