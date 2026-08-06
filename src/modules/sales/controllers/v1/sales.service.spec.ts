import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../sales.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { MidtransService } from '../../core/helpers/midtrans.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from '@modules/sales/core/dto/create-sale.dto';

describe('SalesService Unit Tests', () => {
  let service: SalesService;
  let prisma: PrismaService;
  let midtransService: MidtransService;

  const mockProduct = {
    id: 1,
    name: 'Susu UHT Cokelat 250ml',
    sku: 'SKU-SUSU-UHT-001',
    price: 6500,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    category_id: 1,
  };

  const mockStockRecord = {
    id: 1,
    product_id: 1,
    quantity: 50, // Available stock: 50
    type: 'IN',
    created_at: new Date(),
    updated_at: new Date(),
    transaction_id: null,
  };

  const mockTransaction = {
    id: 1,
    invoice_number: 'INV-MOCK-12345',
    subtotal: 13000,
    tax: 0,
    discount: 0,
    total: 13000,
    status: 'PENDING',
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    transaction_items: [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        price: 6500,
        subtotal: 13000,
        product: mockProduct,
      },
    ],
    payment: {
      id: 1,
      payment_method: 'MIDTRANS_REDIRECT',
      payment_gateway: 'MIDTRANS',
      reference_id: 'snap-token-12345',
      status: 'PENDING',
      checkout_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-12345',
      transaction_id: 1,
    },
  };

  const mockPrismaService = {
    product: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    stock: {
      aggregate: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockMidtransService = {
    createSnapTransaction: jest.fn(),
    verifyNotificationSignature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MidtransService,
          useValue: mockMidtransService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    prisma = module.get<PrismaService>(PrismaService);
    midtransService = module.get<MidtransService>(MidtransService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    const createSaleDto: CreateSaleDto = {
      payment_method: 'MIDTRANS_REDIRECT',
      tax: 0,
      discount: 0,
      items: [
        {
          product_id: 1,
          quantity: 2,
        },
      ],
    };

    it('should successfully checkout with MIDTRANS_REDIRECT (Snap payment)', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock.aggregate.mockResolvedValue({ _sum: { quantity: 50 } });
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
      mockMidtransService.createSnapTransaction.mockResolvedValue({
        token: 'snap-token-12345',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-12345',
      });
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.checkout(1, createSaleDto);

      expect(result).toBeDefined();
      expect(mockMidtransService.createSnapTransaction).toHaveBeenCalledWith({
        amount: 13000,
        referenceId: expect.any(String),
      });
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          payment_method: 'MIDTRANS_REDIRECT',
          payment_gateway: 'MIDTRANS',
          reference_id: 'snap-token-12345',
          status: 'PENDING',
          checkout_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-12345',
          transaction_id: mockTransaction.id,
        },
      });
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          product_id: 1,
          quantity: -2,
          type: 'OUT',
          notes: expect.any(String),
          transaction_id: mockTransaction.id,
        },
      });
    });

    it('should successfully checkout with CASH payment (Paid immediately)', async () => {
      const cashSaleDto: CreateSaleDto = {
        ...createSaleDto,
        payment_method: 'CASH',
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.stock.aggregate.mockResolvedValue({ _sum: { quantity: 50 } });
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.checkout(1, cashSaleDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        data: { status: 'PAID' },
      });
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          payment_method: 'CASH',
          status: 'PAID',
          paid_at: expect.any(Date),
          transaction_id: mockTransaction.id,
        },
      });
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          product_id: 1,
          quantity: -2,
          type: 'OUT',
          notes: expect.any(String),
          transaction_id: mockTransaction.id,
        },
      });
    });

    it('should throw BadRequestException if product is not found', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(service.checkout(1, createSaleDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product is not active', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue({ ...mockProduct, is_active: false });

      await expect(service.checkout(1, createSaleDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);
      mockPrismaService.stock.aggregate.mockResolvedValue({ _sum: { quantity: 1 } }); // Only 1 available, kasir asks for 2

      await expect(service.checkout(1, createSaleDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    const mockHeaders = {};

    const mockBody = {
      order_id: 'INV-MOCK-12345',
      transaction_status: 'settlement',
      status_code: '200',
      signature_key: 'valid-signature',
      gross_amount: '13000.00',
      transaction_id: 'snap-token-12345',
    };

    it('should successfully handle PAID webhook without creating extra stock OUT records', async () => {
      mockMidtransService.verifyNotificationSignature.mockReturnValue(true);
      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);

      await service.handleWebhook(mockHeaders, mockBody);

      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        data: { status: 'PAID' },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.payment.id },
        data: { status: 'PAID', paid_at: expect.any(Date) },
      });
      expect(mockPrismaService.stock.create).not.toHaveBeenCalled();
    });

    it('should successfully handle FAILED webhook and restore stock', async () => {
      const failedBody = {
        ...mockBody,
        transaction_status: 'expire',
      };

      mockMidtransService.verifyNotificationSignature.mockReturnValue(true);
      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);

      await service.handleWebhook(mockHeaders, failedBody);

      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        data: { status: 'FAILED' },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.payment.id },
        data: { status: 'FAILED' },
      });
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          product_id: 1,
          quantity: 2,
          type: 'IN',
          notes: expect.any(String),
          transaction_id: mockTransaction.id,
        },
      });
    });

    it('should throw BadRequestException if webhook signature check fails', async () => {
      mockMidtransService.verifyNotificationSignature.mockReturnValue(false);

      await expect(service.handleWebhook(mockHeaders, mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if invoice is not found in database', async () => {
      mockMidtransService.verifyNotificationSignature.mockReturnValue(true);
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.handleWebhook(mockHeaders, mockBody)).rejects.toThrow(NotFoundException);
    });
  });

  describe('voidTransaction', () => {
    it('should successfully void a PAID transaction and restore stock', async () => {
      const mockPaidTransaction = {
        ...mockTransaction,
        status: 'PAID',
        payment: {
          ...mockTransaction.payment,
          status: 'PAID',
        },
      };

      mockPrismaService.transaction.findFirst.mockResolvedValue(mockPaidTransaction);
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockPaidTransaction);

      const result = await service.voidTransaction(1);

      expect(result).toBeDefined();
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: mockPaidTransaction.id },
        data: { status: 'CANCELLED' },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: mockPaidTransaction.payment.id },
        data: { status: 'CANCELLED' },
      });
      // Memastikan pembuatan data mutasi IN baru (kuantitas positif +2) untuk mengembalikan stok
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          product_id: 1,
          quantity: 2,
          type: 'IN',
          notes: expect.any(String),
          transaction_id: mockPaidTransaction.id,
        },
      });
    });

    it('should successfully void a PENDING transaction and restore stock', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.voidTransaction(1);

      expect(result).toBeDefined();
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        data: { status: 'CANCELLED' },
      });
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          product_id: 1,
          quantity: 2,
          type: 'IN',
          notes: expect.any(String),
          transaction_id: mockTransaction.id,
        },
      });
    });

    it('should throw BadRequestException if transaction is already CANCELLED', async () => {
      const mockCancelledTransaction = {
        ...mockTransaction,
        status: 'CANCELLED',
      };

      mockPrismaService.transaction.findFirst.mockResolvedValue(mockCancelledTransaction);

      await expect(service.voidTransaction(1)).rejects.toThrow(BadRequestException);
    });
  });
});
