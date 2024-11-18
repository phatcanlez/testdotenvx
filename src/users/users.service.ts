import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LoginReqBody, RegisterReqBody } from './users.request';
import { UserDto, UserRole, UserVerifyStatus } from './user.dto';
import { JwtUtilsService } from 'src/utils/jwt/jwtUtils.service';
import { ConfigService } from '@nestjs/config';
import { TokenDto, TokenType } from 'src/utils/jwt/jwt.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly configService: ConfigService,
  ) {}

  signAccessToken({ user_id, role }: { user_id: string; role: UserRole }) {
    return this.jwtUtilsService.signToken({
      payload: { user_id, role },
      options: {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      },
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  signRefreshToken({ user_id, role }: { user_id: string; role: UserRole }) {
    return this.jwtUtilsService.signToken({
      payload: { user_id, role },
      options: {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES_IN',
        ),
      },
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  signEmailToken({ user_id, role }: { user_id: string; role: UserRole }) {
    return this.jwtUtilsService.signToken({
      payload: { user_id, role },
      options: {
        expiresIn: this.configService.get<string>('JWT_EMAIL_TOKEN_EXPIRES_IN'),
      },
      secret: this.configService.get<string>('JWT_EMAIL_TOKEN_SECRET'),
    });
  }

  async checkEmail(email: string) {
    const result = await this.databaseService.Users.findUnique({
      where: {
        email,
      },
    });
    return result;
  }

  async checkEmailVerifyToken({
    email_verify_token,
    user_id,
  }: {
    email_verify_token: string;
    user_id: string;
  }) {
    const result = await this.databaseService.Users.findFirst({
      where: {
        id: user_id,
        email_verify_token,
      },
    });
    return Boolean(result);
  }

  async checkVerifyStatus(user_id: string) {
    const result = await this.databaseService.Users.findUnique({
      where: {
        id: user_id,
      },
    });
    return result.verify_status;
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
    const email_verify_token = await this.signEmailToken({
      user_id: result.id,
      role: UserRole.USER,
    });
    const user = await this.databaseService.Users.update({
      where: {
        id: result.id,
      },
      data: {
        username: `user${result.id}`,
        email_verify_token,
        updated_at: new Date(),
      },
    });
    //send email verify token to user email
    console.log(
      `http://localhost:3000/users/email-verify?email_verify_token=${email_verify_token}`,
    );
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id: user.id, role: user.role }),
      this.signRefreshToken({ user_id: user.id, role: user.role }),
    ]);
    await this.databaseService.Tokens.create({
      data: new TokenDto({
        token: refresh_token,
        token_type: TokenType.REFRESH_TOKEN,
        user_id: user.id,
      }),
    });
    //create access token and refresh token then return
    return { access_token, refresh_token };
  }

  async login(data: LoginReqBody) {
    const { email, password } = data;
    const user = await this.databaseService.Users.findFirst({
      where: {
        email,
        password,
      },
    });
    if (!user) {
      return null;
    }
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id: user.id, role: user.role }),
      this.signRefreshToken({ user_id: user.id, role: user.role }),
    ]);

    await this.databaseService.Tokens.create({
      data: new TokenDto({
        token: refresh_token,
        token_type: TokenType.REFRESH_TOKEN,
        user_id: user.id,
      }),
    });
    //create access token and refresh token then return
    return { access_token, refresh_token };
  }

  async emailVerify({
    email_verify_token,
    user_id,
  }: {
    email_verify_token: string;
    user_id: string;
  }) {
    await this.databaseService.Users.update({
      where: {
        id: user_id,
        email_verify_token,
      },
      data: {
        verify_status: UserVerifyStatus.VERIFIED,
        email_verify_token: '',
        updated_at: new Date(),
      },
    });
  }
}
