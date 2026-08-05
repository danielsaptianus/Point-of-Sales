import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './controllers/v1/categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaService } from '@common/prisma/prisma.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockPrismaService = {
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
