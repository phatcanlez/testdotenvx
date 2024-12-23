import { Controller, Get, Query } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  ChatGateway: ChatGateway;
  constructor(chatGateway: ChatGateway) {
    this.ChatGateway = chatGateway;
  }

  @Get('test')
  test(@Query('message') message: string) {
    console.log('chat controller');
    this.ChatGateway.findOne(message);
  }
}
