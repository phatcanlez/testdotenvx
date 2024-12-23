import { JoinChatDto } from './join-chat.dto';

export class SendMessDto extends JoinChatDto {
  message: string;
  timestamp: Date;
}
