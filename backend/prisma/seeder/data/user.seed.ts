import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (
  prisma: PrismaClient,
  adminPositionId: number,
  memberPositionId: number,
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

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@kulidigital.com',
      password: hashedPassword,
      is_active: true,
      employee: {
        create: {
          employee_number: 'EMP-STAFF-001',
          first_name: 'Staff',
          last_name: 'Kuli Digital',
          gender: 'Female',
          position_id: memberPositionId,
          is_active: true,
        },
      },
    },
  });

  console.log('✅ Users seeded');

  return { adminUser, memberUser, defaultPassword };
};
