import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const positions = await prisma.position.findMany();
  console.log('Positions in DB:', positions);
}
main().catch(console.error).finally(() => prisma.$disconnect());
