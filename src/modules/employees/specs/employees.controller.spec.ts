import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from '../controllers/v1/employees.controller';
import { EmployeesService } from '../employees.service';
import { PrismaService } from '@common/prisma/prisma.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const mockPrismaService = {
    employee: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
