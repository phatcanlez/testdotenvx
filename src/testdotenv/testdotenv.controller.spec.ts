import { Test, TestingModule } from '@nestjs/testing';
import { TestdotenvController } from './testdotenv.controller';

describe('TestdotenvController', () => {
  let controller: TestdotenvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestdotenvController],
    }).compile();

    controller = module.get<TestdotenvController>(TestdotenvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
