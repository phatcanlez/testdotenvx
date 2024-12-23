import { Injectable } from '@nestjs/common';
import { SendMessDto } from './dto/send-mess.dto';
import { JoinChatDto } from './dto/join-chat.dto';

@Injectable()
export class ChatService {
  listAcc: string[] = [];

  create(createChatDto: SendMessDto) {
    return 'This action adds a new chat';
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: JoinChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }

  join(username: string) {
    this.listAcc.push(username);
    return this.listAcc;
  }
}
