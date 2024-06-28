import { Test, TestingModule } from '@nestjs/testing';
import { SharedStorageController } from './shared-storage.controller';

describe('SharedStorageController', () => {
  let controller: SharedStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedStorageController],
    }).compile();

    controller = module.get<SharedStorageController>(SharedStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
