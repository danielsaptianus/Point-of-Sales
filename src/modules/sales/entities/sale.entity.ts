import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction, TransactionItem, Payment } from '@prisma/client';
import { ProductEntity } from '@modules/products/entities/product.entity';

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

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}

export class SaleItemEntity implements Partial<TransactionItem> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  product_id: number;

  @ApiPropertyOptional({ type: () => ProductEntity })
  product?: ProductEntity;

  constructor(partial: Partial<SaleItemEntity>) {
    Object.assign(this, partial);
    if (partial.product) {
      this.product = new ProductEntity(partial.product);
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

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
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
