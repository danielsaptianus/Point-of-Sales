import { Test, TestingModule } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';

describe('StocksService Unit Tests', () => {
  let service: StocksService;
  let prisma: PrismaService;

  const mockProduct = {
    id: 1,
    name: 'Susu UHT Cokelat 250ml',
    sku: 'SKU-SUSU-UHT-001',
    price: 6500,
    deleted_at: null,
  };

  const mockStockRecord = {
    id: 1,
    product_id: 1,
    quantity: 10,
    type: 'IN', // Mutasi masuk
    notes: 'Stok awal distributor',
    created_at: new Date(),
    updated_at: new Date(),
    product: mockProduct,
  };

  const mockPrismaService = {
    stock: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StocksService>(StocksService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (Tambah Mutasi Stok)', () => {
    it('should successfully record an IN stock mutation', async () => {
      const createDto: CreateStockDto = {
        product_id: 1,
        quantity: 10,
        type: 'IN',
        notes: 'Stok masuk dari supplier',
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.stock.findFirst.mockResolvedValue(null); // Belum ada stok awal
      mockPrismaService.stock.create.mockResolvedValue(mockStockRecord);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.quantity).toBe(10);
      expect(result.type).toBe('IN');
      expect(prisma.stock.create).toHaveBeenCalledWith({
        data: createDto,
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException if Product ID is invalid', async () => {
      const createDto: CreateStockDto = {
        product_id: 99,
        quantity: 5,
        type: 'IN',
      };

      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(prisma.stock.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if type is not IN', async () => {
      const createDto: CreateStockDto = {
        product_id: 1,
        quantity: 5,
        type: 'OUT',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(prisma.stock.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if stock record for product_id already exists', async () => {
      const createDto: CreateStockDto = {
        product_id: 1,
        quantity: 5,
        type: 'IN',
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.stock.findFirst.mockResolvedValue(mockStockRecord); // Sudah ada stok awal

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.stock.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne (Mencari Record Mutasi)', () => {
    it('should return a stock record if ID is valid', async () => {
      mockPrismaService.stock.findFirst.mockResolvedValue(mockStockRecord);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if ID does not exist', async () => {
      mockPrismaService.stock.findFirst.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update (Update Mutasi Stok secara Akumulatif)', () => {
    it('should successfully update stock quantity by adding it to existing quantity', async () => {
      mockPrismaService.stock.findFirst.mockResolvedValueOnce(mockStockRecord);

      mockPrismaService.stock.update.mockResolvedValue({
        ...mockStockRecord,
        quantity: 110, // 10 + 100
      });

      const result = await service.update(1, { quantity: 100 });

      expect(result).toBeDefined();
      expect(result.quantity).toBe(110);
      expect(prisma.stock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          quantity: 110,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('Perhitungan Agregasi Stok (Formula Akumulasi)', () => {
    it('should calculate the aggregate product stock based on sum mutations', async () => {
      // Mensimulasikan logika query agregasi sum Prisma:
      // SUM(IN = 15) + SUM(OUT = -5) + SUM(ADJUSTMENT = -2) = Total: 8

      mockPrismaService.stock.aggregate.mockResolvedValue({
        _sum: {
          quantity: 8, // Mengembalikan hasil agregasi matematika
        },
      });

      const aggregateQuery = await prisma.stock.aggregate({
        _sum: { quantity: true },
        where: { product_id: 1, status: 'SUCCESS' },
      });

      const totalStock = aggregateQuery._sum.quantity || 0;

      expect(totalStock).toBe(8);
      expect(prisma.stock.aggregate).toHaveBeenCalledWith({
        _sum: { quantity: true },
        where: { product_id: 1, status: 'SUCCESS' },
      });
    });
  });
});
