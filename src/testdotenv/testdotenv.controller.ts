import { Controller, Get } from '@nestjs/common';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('testdotenv')
export class TestdotenvController {
  ChatGateway: ChatGateway;

  constructor() {}
  @Get('test')
  test() {
    console.log(process.env.TEST);
    return;
  }
}
