import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterReqBody } from './users.request';
import {
  AccessTokenAuthGuard,
  EmailVerifyTokenAuthGuard,
  RoleAuthGuard,
} from 'src/auth/auth.guard';
import { Roles } from 'src/utils/decorators/role.decorator';
import { UserRole, UserVerifyStatus } from './user.dto';
import { Request } from 'express';

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

  @Get('email-verify')
  @UseGuards(EmailVerifyTokenAuthGuard)
  async emailVerify(
    @Query('email_verify_token') email_verify_token: string,
    @Req() req: Request,
  ) {
    const { user_id } = req.decoded_email_verify;
    const userStatus = await this.usersService.checkVerifyStatus(user_id);
    if (userStatus === UserVerifyStatus.VERIFIED) {
      return {
        message: 'Email is already verified',
      };
    } else if (userStatus === UserVerifyStatus.BANNED) {
      return {
        message: 'User is banned',
      };
    }
    const isvalidToken = await this.usersService.checkEmailVerifyToken({
      email_verify_token,
      user_id,
    });
    if (!isvalidToken) {
      return {
        message: 'Email verify token is invalid or expired',
      };
    }
    await this.usersService.emailVerify({
      email_verify_token,
      user_id,
    });
    return {
      message: 'Email is verified',
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
