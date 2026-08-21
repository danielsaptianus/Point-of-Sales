import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateVoucherDto } from './core/dto/create-voucher.dto';
import { UpdateVoucherDto } from './core/dto/update-voucher.dto';
import { ValidateVoucherDto } from './core/dto/validate-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({
      where: { code: createVoucherDto.code },
    });
    if (existing) {
      throw new BadRequestException(`Voucher with code ${createVoucherDto.code} already exists`);
    }

    return this.prisma.voucher.create({
      data: {
        ...createVoucherDto,
        start_date: new Date(createVoucherDto.start_date),
        end_date: new Date(createVoucherDto.end_date),
      },
    });
  }

  findAll() {
    return this.prisma.voucher.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const voucher = await this.prisma.voucher.findFirst({
      where: { id, deleted_at: null },
    });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return voucher;
  }

  async update(id: number, updateVoucherDto: UpdateVoucherDto) {
    await this.findOne(id); // Ensure exists
    
    // Ensure code uniqueness if changing code
    if (updateVoucherDto.code) {
      const existing = await this.prisma.voucher.findUnique({
        where: { code: updateVoucherDto.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Voucher with code ${updateVoucherDto.code} already exists`);
      }
    }

    const dataToUpdate: any = { ...updateVoucherDto };
    if (updateVoucherDto.start_date) dataToUpdate.start_date = new Date(updateVoucherDto.start_date);
    if (updateVoucherDto.end_date) dataToUpdate.end_date = new Date(updateVoucherDto.end_date);

    return this.prisma.voucher.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.voucher.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async validateAndCalculateVoucher(dto: ValidateVoucherDto) {
    const { code, subtotal } = dto;

    const voucher = await this.prisma.voucher.findFirst({
      where: { code, deleted_at: null },
    });

    // 1 & 2: Cari voucher berdasarkan code, jika tidak ditemukan tolak
    if (!voucher) {
      throw new BadRequestException('Voucher tidak ditemukan');
    }

    // 3: Pastikan is_active = true
    if (!voucher.is_active) {
      throw new BadRequestException('Voucher tidak aktif');
    }

    const now = new Date();
    
    // 4: Pastikan current datetime >= start_date
    if (now < voucher.start_date) {
      throw new BadRequestException('Voucher belum berlaku');
    }

    // 5: Pastikan current datetime <= end_date
    if (now > voucher.end_date) {
      throw new BadRequestException('Voucher sudah expired');
    }

    // 6: Jika usage_limit memiliki nilai, pastikan used_count < usage_limit
    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      throw new BadRequestException('Voucher sudah mencapai batas penggunaan');
    }

    // 7: Jika min_transaction memiliki nilai, pastikan subtotal >= min_transaction
    if (voucher.min_transaction !== null && Number(subtotal) < Number(voucher.min_transaction)) {
      throw new BadRequestException('Minimum transaksi belum terpenuhi');
    }

    // Validasi lolos, Hitung Diskon
    let discount = 0;
    const discountValue = Number(voucher.discount_value);

    if (voucher.discount_type === 'FIXED') {
      discount = discountValue;
    } else if (voucher.discount_type === 'PERCENTAGE') {
      discount = (subtotal * discountValue) / 100;
    }

    // Jika max_discount memiliki nilai
    if (voucher.max_discount !== null) {
      const maxDiscount = Number(voucher.max_discount);
      discount = Math.min(discount, maxDiscount);
    }

    // discount tidak boleh lebih besar dari subtotal
    discount = Math.min(discount, subtotal);

    return {
      isValid: true,
      voucher,
      discount_amount: discount,
    };
  }
}
