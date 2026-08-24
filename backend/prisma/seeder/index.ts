import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedPositions } from './data/position.seed';
import { seedPermissions } from './data/permission.seed';
import { seedUsers } from './data/user.seed';
import { seedProductsAndCategories } from './data/product.seed';
import { seedVouchers } from './data/voucher.seed';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.transactionItemBatch.deleteMany();
  await prisma.transactionVoucher.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.positionPermission.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.position.deleteMany();

  // Run seeders
  const { adminPosition, kasirPosition, gudangPosition } = await seedPositions(prisma);
  await seedPermissions(prisma, adminPosition.id, kasirPosition.id, gudangPosition.id);
  const { adminUser, kasirUser, gudangUser, defaultPassword } = await seedUsers(
    prisma,
    adminPosition.id,
    kasirPosition.id,
    gudangPosition.id,
  );
  
  await seedProductsAndCategories(prisma);
  await seedVouchers(prisma);

  // Summary
  console.log('\n✨ Database seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`   - Positions: ${await prisma.position.count()}`);
  console.log(`   - Permissions: ${await prisma.permission.count()}`);
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(
    `   - Position-Permission Links: ${await prisma.positionPermission.count()}\n`,
  );

  console.log('🔑 Default Users:');
  console.log(`   Admin: ${adminUser.email} / ${defaultPassword}`);
  console.log(`   Kasir: ${kasirUser.email} / ${defaultPassword}`);
  console.log(`   Gudang: ${gudangUser.email} / ${defaultPassword}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
