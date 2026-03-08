import prisma from './src/db';

async function check() {
  const lotes = await prisma.lote.findMany();
  console.log('Lotes in DB:', lotes);
}
check().catch(console.error).finally(() => prisma.$disconnect());
