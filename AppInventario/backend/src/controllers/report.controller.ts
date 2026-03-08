import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Report 1: Inventory Movements restricted by Date Range
export const getInventoryReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
       res.status(400).json({ error: 'Debes proveer una fecha de inicio y una fecha de fin' });
       return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    // Expand End Date to include the entire day if it's just a YYYY-MM-DD
    end.setHours(23, 59, 59, 999);

    const movimientos = await prisma.movimientoInventario.findMany({
      where: {
         timestamp: {
           gte: start,
           lte: end,
         }
      },
      include: {
        producto: { select: { nombre: true, sku: true } },
        usuario: { select: { nombre: true } },
        almacenOrigen: { select: { nombre: true } },
        almacenDestino: { select: { nombre: true } },
      },
      orderBy: { timestamp: 'desc' }
    });

    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ error: 'Error interno del servidor al generar reporte de movimientos' });
  }
};

// Report 2: Low Stock Global Analysis
export const getLowStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const stockPorProducto = await prisma.movimientoInventario.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true,
      },
    });

    const itemsLowStock: any[] = [];

    // Map through stock aggregates to evaluate
    for (const stock of stockPorProducto) {
      if (!stock.productoId) continue;
      
      const qty = stock._sum.cantidad || 0;
      
      const product = await prisma.producto.findUnique({
        where: { sku: stock.productoId },
        select: { sku: true, nombre: true, stockMinimo: true, categoria: { select: { nombre: true } } }
      });

      if (product && qty <= product.stockMinimo) {
        itemsLowStock.push({
           sku: product.sku,
           nombre: product.nombre,
           categoria: product.categoria.nombre,
           cantidadActual: qty,
           stockMinimo: product.stockMinimo,
           deficit: product.stockMinimo - qty
        });
      }
    }

    // Sort by largest deficit
    itemsLowStock.sort((a, b) => b.deficit - a.deficit);

    res.status(200).json(itemsLowStock);
  } catch (error) {
    console.error('Error generating low stock report:', error);
    res.status(500).json({ error: 'Error interno del servidor al generar reporte de bajo stock' });
  }
};
