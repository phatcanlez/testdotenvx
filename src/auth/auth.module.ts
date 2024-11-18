import { Module } from '@nestjs/common';
import {
  AccessTokenAuthGuard,
  EmailVerifyTokenAuthGuard,
  RoleAuthGuard,
} from './auth.guard';
import { JwtUtilsModule } from 'src/utils/jwt/jwtUtils.module';

@Module({
  imports: [JwtUtilsModule],
  providers: [AccessTokenAuthGuard, RoleAuthGuard, EmailVerifyTokenAuthGuard],
})
export class AuthModule {}
