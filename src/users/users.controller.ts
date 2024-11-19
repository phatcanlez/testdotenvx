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
import {
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
} from './users.request';
import {
  AccessTokenAuthGuard,
  EmailVerifyTokenAuthGuard,
  RefreshTokenAuthGuard,
  RoleAuthGuard,
} from 'src/auth/auth.guard';
import { Roles } from 'src/utils/decorators/role.decorator';
import { UserRole, UserVerifyStatus } from './user.dto';
import { Request } from 'express';
import { ApiBody, ApiHeader, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiBody({
    type: RegisterReqBody,
    required: true,
    description: 'Register body',
  })
  @ApiResponse({
    status: 200,
    description: 'Register successfully',
    schema: {
      example: {
        message: 'Register successfully',
        result: {
          access_token: 'access_token',
          refresh_token: 'refresh_token',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Email is already existed',
    schema: {
      example: {
        message: 'Email is already existed',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        message: 'Bad request',
      },
    },
  })
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
  @ApiBody({
    type: LoginReqBody,
    required: true,
    description: 'Login body',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    schema: {
      example: {
        message: 'Login successfully',
        result: {
          access_token: 'access_token',
          refresh_token: 'refresh_token',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        message: 'Bad request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email or password is incorrect',
    schema: {
      example: {
        message: 'Email or password is incorrect',
      },
    },
  })
  async login(@Body(new ValidationPipe()) body: LoginReqBody) {
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
  @ApiQuery({
    name: 'email_verify_token',
    required: true,
    type: String,
    description: 'Email verify token',
  })
  @ApiResponse({
    status: 200,
    description:
      'Email verified successfully | Email is already verified | User is banned | Email verify token is invalid or expired',
    schema: {
      example: {
        message:
          'Email verified successfully | Email is already verified | User is banned | Email verify token is invalid or expired',
      },
    },
  })
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
      message: 'Email verified successfully',
    };
  }

  @Get()
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
  })
  @ApiResponse({
    status: 200,
    description: 'Get users successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(AccessTokenAuthGuard, RoleAuthGuard)
  async users() {
    const result = await this.usersService.users();
    return {
      message: 'Get users successfully',
      result,
    };
  }

  @Post('logout')
  @UseGuards(AccessTokenAuthGuard, RefreshTokenAuthGuard)
  async logout(@Body() body: LogoutReqBody, @Req() req: Request) {
    const { user_id } = req.decoded_authorization;
    const { refresh_token } = body;
    const refresh_token_id = await this.usersService.checkRefreshToken({
      user_id,
      refresh_token,
    });
    if (!refresh_token_id) {
      throw new UnauthorizedException('Unauthorized Refresh Token');
    }
    await this.usersService.logout(refresh_token_id);
    return {
      message: 'Logout successfully',
    };
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  async refreshToken(@Body() body: RefreshTokenReqBody, @Req() req: Request) {
    const { user_id } = req.decoded_refresh_token;
    const { refresh_token } = body;
    const refresh_token_id = await this.usersService.checkRefreshToken({
      user_id,
      refresh_token,
    });
    if (!refresh_token_id) {
      throw new UnauthorizedException('Unauthorized Refresh Token');
    }
    const tokens = await this.usersService.refreshToken({
      refresh_token_id,
      user_id,
    });
    return {
      message: 'Refresh token successfully',
      result: tokens,
    };
  }
}
