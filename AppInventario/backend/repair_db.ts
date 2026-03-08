import prisma from './src/db';

async function repair() {
  console.log('Starting DB Repair for Stock & Lotes...');
  
  // Wipe lotes to avoid double counting if any exist
  await prisma.lote.deleteMany({});
  
  const movements = await prisma.movimientoInventario.findMany({
      orderBy: { timestamp: 'asc' }
  });

  for (let mov of movements) {
      if (mov.tipo === 'ENTRADA') {
          let lot = await prisma.lote.findFirst({ where: { productoId: mov.productoId } });
          if (!lot) {
              lot = await prisma.lote.create({ 
                  data: { 
                      numeroLote: `LOTE-${mov.productoId}-DEFAULT`, 
                      cantidadDisponible: 0, 
                      productoId: mov.productoId 
                  } 
              });
          }
          await prisma.lote.update({ 
              where: { id: lot.id }, 
              data: { cantidadDisponible: { increment: mov.cantidad } } 
          });
          await prisma.movimientoInventario.update({ 
              where: { id: mov.id }, 
              data: { loteId: lot.id } 
          });
          console.log(`Repaired ENTRADA id: ${mov.id} into Lote ${lot.id}`);
      } else if (mov.tipo === 'SALIDA') {
          let lot = await prisma.lote.findFirst({ where: { productoId: mov.productoId } });
          if (lot) {
              await prisma.lote.update({ 
                  where: { id: lot.id }, 
                  data: { cantidadDisponible: { decrement: mov.cantidad } } 
              });
              await prisma.movimientoInventario.update({ 
                  where: { id: mov.id }, 
                  data: { loteId: lot.id } 
              });
              console.log(`Repaired SALIDA id: ${mov.id} from Lote ${lot.id}`);
          }
      }
  }
  
  console.log('Repair Complete!');
}

repair().catch(console.error).finally(() => prisma.$disconnect());
