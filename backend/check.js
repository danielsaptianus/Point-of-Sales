const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.transaction.findMany({ orderBy: { id: 'desc' }, take: 3 });
  console.log(JSON.stringify(t, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
