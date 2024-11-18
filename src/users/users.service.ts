import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LoginReqBody, RegisterReqBody } from './users.request';
import { UserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async checkEmail(email: string) {
    const result = await this.databaseService.Users.findUnique({
      where: {
        email,
      },
    });
    return result;
  }

  async users() {
    const result = await this.databaseService.Users.findMany();
    return result;
  }

  async register(data: RegisterReqBody) {
    const { name, email, password } = data;
    const result = await this.databaseService.Users.create({
      data: new UserDto({ name, email, password }),
    });
    const created_user = await this.databaseService.Users.update({
      where: {
        id: result.id,
      },
      data: {
        username: `user${result.id}`,
      },
    });
    //create access token and refresh token then return
    return created_user;
  }

  async login(data: LoginReqBody) {
    const { email, password } = data;
    const user = await this.databaseService.Users.findFirst({
      where: {
        email,
        password,
      },
    });
    //create access token and refresh token then return
    return user;
  }
}
