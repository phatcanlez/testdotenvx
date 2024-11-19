import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  get Users() {
    return this.prisma.users;
  }

  get Tokens() {
    return this.prisma.tokens;
  }
}
