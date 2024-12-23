import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { JoinChatDto } from './dto/join-chat.dto';
import { Server } from 'socket.io';
import { SendMessDto } from './dto/send-mess.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('chat')
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Handle chat message' })
  @SubscribeMessage('chatMessage')
  chatMessage(@MessageBody() sendMessDto: SendMessDto) {
    console.log(sendMessDto);
    this.server.emit('chatCreated', sendMessDto);
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    console.log('findAllChat');
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: string) {
    console.log('findOneChat');
    this.server.emit('findOneChat', id);
    return id;
  }

  @ApiOperation({ summary: 'Join chat' })
  @SubscribeMessage('join')
  join(@MessageBody() joinChatDto: JoinChatDto) {
    console.log('join chat at BE:  ' + joinChatDto.username);
    this.server.emit('joinChat', this.chatService.join(joinChatDto.username));
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
}
