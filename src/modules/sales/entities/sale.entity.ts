import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction, TransactionItem, Payment, Product } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class PaymentEntity implements Partial<Payment> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  payment_method: string;

  @ApiPropertyOptional()
  payment_gateway: string | null;

  @ApiPropertyOptional()
  reference_id: string | null;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  checkout_url: string | null;

  @ApiPropertyOptional()
  paid_at: Date | null;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}

export class SaleItemProductEntity implements Partial<Product> {
  @ApiProperty()
  name: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  price: number;

  @Exclude()
  id: number;

  @Exclude()
  description: string | null;

  @Exclude()
  is_active: boolean;

  @Exclude()
  category_id: number;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  deleted_at: Date | null;

  constructor(partial: Partial<SaleItemProductEntity>) {
    Object.assign(this, partial);
  }
}

export class SaleItemEntity implements Partial<TransactionItem> {
  @Exclude()
  id: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  subtotal: number;

  @Exclude()
  product_id: number;

  @Exclude()
  transaction_id: number;

  @ApiPropertyOptional({ type: () => SaleItemProductEntity })
  product?: SaleItemProductEntity;

  constructor(partial: Partial<SaleItemEntity>) {
    Object.assign(this, partial);
    if (partial.product) {
      this.product = new SaleItemProductEntity(partial.product);
    }
  }
}

export class SaleEntity implements Partial<Transaction> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  invoice_number: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: string;

  @Exclude()
  user_id: number;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  deleted_at: Date | null;

  @ApiPropertyOptional({ type: [SaleItemEntity] })
  transaction_items?: SaleItemEntity[];

  @ApiPropertyOptional({ type: () => PaymentEntity })
  payment?: PaymentEntity;

  constructor(partial: Partial<SaleEntity>) {
    Object.assign(this, partial);
    if (partial.transaction_items) {
      this.transaction_items = partial.transaction_items.map(
        (item) => new SaleItemEntity(item),
      );
    }
    if (partial.payment) {
      this.payment = new PaymentEntity(partial.payment);
    }
  }
}
