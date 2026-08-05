import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '@modules/products/core/dto/create-product.dto';
import { UpdateProductDto } from '@modules/products/core/dto/update-product.dto';

describe('ProductsService Unit Tests', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  // Mock data category dan product
  const mockCategory = {
    id: 1,
    name: 'Minuman Kotak',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockProduct = {
    id: 1,
    name: 'Susu UHT Cokelat 250ml',
    sku: 'SKU-SUSU-UHT-001',
    description: 'Susu rasa cokelat',
    price: 6500,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    category_id: 1,
    category: mockCategory,
  };

  // Mock implementation untuk PrismaService
  const mockPrismaService = {
    product: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks setelah setiap pengujian
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (Tambah Produk)', () => {
    const createDto: CreateProductDto = {
      name: 'Susu UHT Cokelat 250ml',
      sku: 'SKU-SUSU-UHT-001',
      description: 'Susu rasa cokelat',
      price: 6500,
      category_id: 1,
      is_active: true,
    };

    it('should successfully create a product', async () => {
      // Setup mock behavior
      mockPrismaService.product.findFirst.mockResolvedValue(null); // SKU unik
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory); // Kategori valid
      mockPrismaService.product.create.mockResolvedValue(mockProduct); // Produk berhasil dibuat

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.sku).toBe(createDto.sku);
      expect(result.category_id).toBe(createDto.category_id);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: createDto,
        include: { category: true, stocks: true },
      });
    });

    it('should throw ConflictException if SKU already exists', async () => {
      // Mock SKU sudah ada
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if Category ID is invalid', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null); // SKU unik
      mockPrismaService.category.findFirst.mockResolvedValue(null); // Kategori tidak ada

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne (Mencari Produk berdasarkan ID)', () => {
    it('should return a product entity if product exists', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null); // Return null to simulate not found

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update (Memperbarui Produk)', () => {
    const updateDto: UpdateProductDto = {
      price: 7000,
      sku: 'SKU-NEW-SKU',
    };

    it('should successfully update product details', async () => {
      mockPrismaService.product.findFirst
        .mockResolvedValueOnce(mockProduct) // Untuk pengecekan findOne
        .mockResolvedValueOnce(null); // Untuk pengecekan duplikasi SKU baru

      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        price: 7000,
        sku: 'SKU-NEW-SKU',
      });

      const result = await service.update(1, updateDto);

      expect(result).toBeDefined();
      expect(result.price).toBe(7000);
      expect(result.sku).toBe('SKU-NEW-SKU');
    });
  });

  describe('remove (Soft Delete Produk)', () => {
    it('should perform soft delete by setting deleted_at timestamp', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        deleted_at: new Date(),
      });

      await service.remove(1);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          deleted_at: expect.any(Date),
        }),
      });
    });
  });
});
