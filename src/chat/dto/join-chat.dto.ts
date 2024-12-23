import { ApiProperty } from '@nestjs/swagger';

export class JoinChatDto {
  @ApiProperty({ description: 'Username of the user' })
  username: string;
}
