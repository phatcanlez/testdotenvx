import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload } from './jwt.interface';

@Injectable()
export class JwtUtilsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken({
    payload,
    options = {
      algorithm: 'HS256',
    },
    secret = this.configService.get<string>('JWT_SECRET'),
  }: {
    payload: JwtPayload;
    options: JwtSignOptions;
    secret: string;
  }) {
    options.secret = secret;
    return this.jwtService.signAsync(payload, options);
  }

  verifyToken({ token, secret }: { token: string; secret: string }) {
    return this.jwtService.verify<JwtPayload>(token, { secret });
  }
}
