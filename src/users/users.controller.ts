import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterReqBody } from './users.request';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body(new ValidationPipe()) body: RegisterReqBody) {
    const { email } = body;
    const isExistedEmail = await this.usersService.checkEmail(email);
    if (isExistedEmail) {
      return {
        message: 'Email is already existed',
      };
    }
    const result = await this.usersService.register(body);
    return {
      message: 'Register successfully',
      data: result,
    };
  }

  @Post('login')
  async login(@Body(new ValidationPipe()) body: RegisterReqBody) {
    const user = await this.usersService.login(body);
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    return {
      message: 'Login successfully',
      data: user,
    };
  }

  @Get()
  async users() {
    const result = await this.usersService.users();
    return {
      message: 'Get users successfully',
      data: result,
    };
  }
}
