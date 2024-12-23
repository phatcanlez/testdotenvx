import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService {
  private _prismaClient: PrismaClient;

  constructor() {
    this._prismaClient = new PrismaClient();
  }

  get Token() {
    return this._prismaClient.token;
  }

  get User() {
    return this._prismaClient.user;
  }

  get Role() {
    return this._prismaClient.address;
  }

  get UserRole() {
    return this._prismaClient.fish;
  }
}
