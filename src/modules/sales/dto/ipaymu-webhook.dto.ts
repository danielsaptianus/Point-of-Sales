import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class IpaymuWebhookDto {
  @ApiProperty({ example: 219986, description: 'iPaymu transaction ID' })
  @IsNotEmpty()
  trx_id: number;

  @ApiProperty({ example: 'fda5ae73-66d2-468d-8313-3a224c9028a7', description: 'iPaymu session ID' })
  @IsNotEmpty()
  sid: string;

  @ApiProperty({ example: 'INV-1785141425461-871', description: 'POS system invoice number (reference ID)' })
  @IsNotEmpty()
  reference_id: string;

  @ApiProperty({ example: 'berhasil', description: 'Payment status ("berhasil", "gagal", "pending")' })
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 1, description: 'iPaymu status code (1 = Success, -1 = Failed/Expired)' })
  @IsNotEmpty()
  status_code: number;

  @ApiProperty({ example: 'qris', description: 'Payment channel' })
  @IsOptional()
  via?: string;

  @ApiProperty({ example: 'qris', description: 'Payment method' })
  @IsOptional()
  payment_method?: string;

  @ApiProperty({ example: 'qris', description: 'Payment channel' })
  @IsOptional()
  payment_channel?: string;

  @ApiProperty({ example: 10000, description: 'Transaction amount' })
  @IsNumber()
  amount: number;
}
