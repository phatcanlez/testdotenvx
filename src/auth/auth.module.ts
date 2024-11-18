import { Module } from '@nestjs/common';
import { AccessTokenAuthGuard, RoleAuthGuard } from './auth.guard';
import { JwtUtilsModule } from 'src/utils/jwt/jwtUtils.module';

@Module({
  imports: [JwtUtilsModule],
  providers: [AccessTokenAuthGuard, RoleAuthGuard],
})
export class AuthModule {}
