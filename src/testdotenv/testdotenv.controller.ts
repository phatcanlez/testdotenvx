import { Controller, Get } from '@nestjs/common';

@Controller('testdotenv')
export class TestdotenvController {
  constructor() {}
  @Get('test')
  test() {
    console.log(process.env.TEST);
    return process.env.TEST;
  }
}
