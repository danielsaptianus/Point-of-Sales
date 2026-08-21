import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (
  prisma: PrismaClient,
  adminPositionId: number,
  kasirPositionId: number,
  gudangPositionId: number,
) => {
  console.log('👥 Seeding users...');

  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@kulidigital.com',
      password: hashedPassword,
      is_active: true,
      employee: {
        create: {
          employee_number: 'EMP-ADMIN-001',
          first_name: 'Admin',
          last_name: 'Kuli Digital',
          gender: 'Male',
          position_id: adminPositionId,
          is_active: true,
        },
      },
    },
  });

  const kasirUser = await prisma.user.create({
    data: {
      email: 'kasir@kulidigital.com',
      password: hashedPassword,
      is_active: true,
      employee: {
        create: {
          employee_number: 'EMP-KASIR-001',
          first_name: 'Kasir',
          last_name: 'Kuli Digital',
          gender: 'Female',
          position_id: kasirPositionId,
          is_active: true,
        },
      },
    },
  });

  const gudangUser = await prisma.user.create({
    data: {
      email: 'gudang@kulidigital.com',
      password: hashedPassword,
      is_active: true,
      employee: {
        create: {
          employee_number: 'EMP-GUDANG-001',
          first_name: 'Gudang',
          last_name: 'Kuli Digital',
          gender: 'Male',
          position_id: gudangPositionId,
          is_active: true,
        },
      },
    },
  });

  console.log('✅ Users seeded');

  return { adminUser, kasirUser, gudangUser, defaultPassword };
};
