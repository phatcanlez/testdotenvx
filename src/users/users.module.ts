import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtUtilsModule } from 'src/utils/jwt/jwtUtils.module';

@Module({
  imports: [JwtUtilsModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService],
})
export class UsersModule {}
