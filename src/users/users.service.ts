import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LoginReqBody, RegisterReqBody } from './users.request';
import { UserDto, UserRole } from './user.dto';
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
    const user = await this.databaseService.Users.update({
      where: {
        id: result.id,
      },
      data: {
        username: `user${result.id}`,
        updated_at: new Date(),
      },
    });
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
}
