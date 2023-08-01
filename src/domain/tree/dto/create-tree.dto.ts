import { ApiProperty } from '@nestjs/swagger';


export class CreateTreeDto {
  @ApiProperty({ description: 'The name of the tree' })
  name: string;

  @ApiProperty({ description: 'The ID of the user who created the tree' })
  userId: number;
}
