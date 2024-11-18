import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterReqBody } from './users.request';
import { AccessTokenAuthGuard, RoleAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/utils/decorators/role.decorator';
import { UserRole } from './user.dto';

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
      result,
    };
  }

  @Post('login')
  async login(@Body(new ValidationPipe()) body: RegisterReqBody) {
    const tokens = await this.usersService.login(body);
    if (!tokens) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    return {
      message: 'Login successfully',
      result: tokens,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenAuthGuard, RoleAuthGuard)
  async users() {
    const result = await this.usersService.users();
    return {
      message: 'Get users successfully',
      result,
    };
  }
}
