import { PrismaClient } from '@prisma/client';

export const seedPositions = async (prisma: PrismaClient) => {
  console.log('📋 Seeding positions...');
  const adminPosition = await prisma.position.create({
    data: {
      name: 'Admin',
      description: 'Administrator with full system access',
    },
  });

  const kasirPosition = await prisma.position.create({
    data: {
      name: 'Staff Kasir',
      description: 'Cashier with access to POS and Sales',
    },
  });

  const gudangPosition = await prisma.position.create({
    data: {
      name: 'Staff Gudang',
      description: 'Warehouse staff with access to Inventory and Products',
    },
  });

  console.log('✅ Positions seeded');
  return { adminPosition, kasirPosition, gudangPosition };
};
