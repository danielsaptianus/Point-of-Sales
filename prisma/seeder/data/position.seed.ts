import { PrismaClient } from '@prisma/client';

export const seedPositions = async (prisma: PrismaClient) => {
  console.log('📋 Seeding positions...');
  const adminPosition = await prisma.position.create({
    data: {
      name: 'Admin',
      description: 'Administrator with full system access',
    },
  });

  const memberPosition = await prisma.position.create({
    data: {
      name: 'Staff',
      description: 'Staff member with limited permissions',
    },
  });

  console.log('✅ Positions seeded');
  return { adminPosition, memberPosition };
};
