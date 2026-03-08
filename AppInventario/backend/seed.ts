import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  const categories = ['Electrónica', 'Muebles', 'Oficina', 'Limpieza'];
  for (const name of categories) {
    await prisma.categoria.create({
      data: { nombre: name }
    });
  }
  console.log('Categories seeded!');
  
  // Also create a test provider just in case
  await prisma.proveedor.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Proveedor General',
      contacto: 'contacto@proveedor.com'
    }
  });
  console.log('Proveedor seeded!');

  // Hash the real password securely
  const hashedPassword = await bcrypt.hash('Mi_contraseñaISW2', 10);

  // Create an Admin user to satisfy foreign keys
  await prisma.usuario.upsert({
    where: { id: 1 },
    update: {
      email: 'admin@inventario.com',
      password: hashedPassword,
      rol: 'ADMIN'
    },
    create: {
      id: 1,
      nombre: 'Admin Warehouse',
      email: 'admin@inventario.com',
      password: hashedPassword,
      rol: 'ADMIN'
    }
  });
  console.log('System User 1 seeded (admin@inventario.com) as ADMIN');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
