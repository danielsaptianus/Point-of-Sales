import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { OpenShiftDto } from './core/dto/open-shift.dto';
import { CloseShiftDto } from './core/dto/close-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async openShift(userId: number, openShiftDto: OpenShiftDto) {
    // Check if the user already has an OPEN shift
    const existingShift = await this.prisma.shift.findFirst({
      where: {
        user_id: userId,
        status: 'OPEN',
      },
    });

    if (existingShift) {
      throw new BadRequestException('Anda masih memiliki shift yang berstatus OPEN. Tutup shift sebelumnya terlebih dahulu.');
    }

    return this.prisma.shift.create({
      data: {
        user_id: userId,
        starting_cash: openShiftDto.starting_cash,
        status: 'OPEN',
      },
    });
  }

  async closeShift(userId: number, closeShiftDto: CloseShiftDto) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        user_id: userId,
        status: 'OPEN',
      },
    });

    if (!shift) {
      throw new NotFoundException('Tidak ada shift aktif yang bisa ditutup.');
    }

    // Calculate total CASH transactions during this shift
    const cashTransactions = await this.prisma.transaction.aggregate({
      _sum: {
        total: true,
      },
      where: {
        shift_id: shift.id,
        status: 'PAID',
        payment: {
          payment_method: 'CASH',
        },
      },
    });

    const totalCashSales = cashTransactions._sum.total || 0;
    const expectedEndingCash = shift.starting_cash + totalCashSales;
    const difference = closeShiftDto.actual_ending_cash - expectedEndingCash;

    return this.prisma.shift.update({
      where: { id: shift.id },
      data: {
        end_time: new Date(),
        expected_ending_cash: expectedEndingCash,
        actual_ending_cash: closeShiftDto.actual_ending_cash,
        difference,
        notes: closeShiftDto.notes,
        status: 'CLOSED',
      },
    });
  }

  async getCurrentShift(userId: number) {
    return this.prisma.shift.findFirst({
      where: {
        user_id: userId,
        status: 'OPEN',
      },
      include: {
        transactions: {
          where: {
            status: 'PAID',
            payment: { payment_method: 'CASH' }
          },
          select: {
            total: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.shift.findMany({
      include: {
        user: {
          include: { employee: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
