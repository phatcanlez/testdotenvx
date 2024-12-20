import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { VnpayService } from './vnpay/vnpay.service';
import { VnpayController } from './vnpay/vnpay.controller';
import { VnpayModule } from './vnpay/vnpay.module';
import { TestdotenvController } from './testdotenv/testdotenv.controller';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VnpayModule,
  ],
  controllers: [AppController, VnpayController, TestdotenvController],
  providers: [AppService, VnpayService],
})
export class AppModule {}
