import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class MidtransWebhookDto {
  @ApiProperty({
    example: 'INV-1785141425461-871',
    description: 'POS system invoice number (reference ID)',
  })
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @ApiProperty({
    example: 'settlement',
    description:
      'Transaction status ("settlement", "pending", "capture", "deny", "expire", "cancel")',
  })
  @IsNotEmpty()
  @IsString()
  transaction_status: string;

  @ApiProperty({ example: '200', description: 'Status code' })
  @IsNotEmpty()
  @IsString()
  status_code: string;

  @ApiProperty({
    example: 'fda5ae73-66d2-468d-8313-3a224c9028a7',
    description: 'Midtrans signature key',
  })
  @IsNotEmpty()
  @IsString()
  signature_key: string;

  @ApiProperty({ example: '10000.00', description: 'Transaction gross amount' })
  @IsNotEmpty()
  @IsString()
  gross_amount: string;

  @ApiProperty({
    example: '4b68e9f5-1b48-433b-85be-58727a8581e6',
    description: 'Midtrans transaction ID',
  })
  @IsNotEmpty()
  @IsString()
  transaction_id: string;

  @ApiProperty({ example: '2026-07-29 10:00:00', description: 'Transaction time' })
  @IsOptional()
  @IsString()
  transaction_time?: string;

  @ApiProperty({ example: 'credit_card', description: 'Payment type' })
  @IsOptional()
  @IsString()
  payment_type?: string;

  @ApiProperty({ example: 'midtrans payment notification', description: 'Status message' })
  @IsOptional()
  @IsString()
  status_message?: string;

  @ApiProperty({ example: 'G13511', description: 'Merchant ID' })
  @IsOptional()
  @IsString()
  merchant_id?: string;
}
