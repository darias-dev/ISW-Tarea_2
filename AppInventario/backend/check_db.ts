import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.usuario.findMany();
  console.log('Users:', users);
}

check().catch(console.error).finally(() => prisma.$disconnect());
