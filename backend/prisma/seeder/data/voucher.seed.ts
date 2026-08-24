import { PrismaClient } from '@prisma/client';

export async function seedVouchers(prisma: PrismaClient) {
  console.log('🎟️ Seeding vouchers...');

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const vouchers = [
    {
      code: 'PROMO2026',
      name: 'Promo Merdeka 2026',
      description: 'Diskon 20% maksimal Rp20.000 untuk pelanggan Arto POS.',
      discount_type: 'PERCENTAGE',
      discount_value: 20,
      max_discount: 20000,
      min_transaction: 50000,
      start_date: today,
      end_date: nextYear,
      usage_limit: 100,
      used_count: 0,
      is_active: true,
    },
    {
      code: 'MAKANHEMAT',
      name: 'Voucher Makan Hemat',
      description: 'Potongan harga flat Rp 15.000 untuk pembelian minimal Rp 100.000.',
      discount_type: 'FIXED',
      discount_value: 15000,
      max_discount: 15000,
      min_transaction: 100000,
      start_date: today,
      end_date: nextMonth,
      usage_limit: 50,
      used_count: 0,
      is_active: true,
    },
    {
      code: 'EXPIRED123',
      name: 'Promo Jadul',
      description: 'Voucher yang sudah kadaluarsa (untuk testing).',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      max_discount: 5000,
      min_transaction: 0,
      start_date: new Date(2023, 0, 1),
      end_date: new Date(2023, 11, 31),
      usage_limit: null,
      used_count: 0,
      is_active: true,
    }
  ];

  let count = 0;
  for (const vData of vouchers) {
    await prisma.voucher.create({ data: vData });
    count++;
  }

  console.log(`✅ ${count} vouchers seeded`);
}
