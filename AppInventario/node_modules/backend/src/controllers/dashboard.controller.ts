import { Request, Response } from 'express';
import prisma from '../db';

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total Products
    const totalProducts = await prisma.producto.count();

    // 2. Total Inventory Value & Low Stock Alerts
    // To get the inventory value accurately, we sum up (Lote.cantidadDisponible * Producto.precio)
    const lotes = await prisma.lote.findMany({
      include: {
        producto: true
      }
    });

    let inventoryValue = 0;
    const lowStockItems: any[] = [];

    lotes.forEach((lote: any) => {
      inventoryValue += (lote.cantidadDisponible * lote.producto.precio);
      const minStock = lote.producto.stockMinimo || 10;
      if (lote.cantidadDisponible <= minStock) {
         lowStockItems.push({
             sku: lote.producto.sku,
             nombre: lote.producto.nombre,
             loteId: lote.id,
             loteNumero: lote.numeroLote,
             cantidad: lote.cantidadDisponible,
             minimo: minStock,
             unidad: lote.producto.unidad,
             categoria: lote.producto.categoriaId
         });
      }
    });

    // 3. Recent Movements (last 5)
    const recentMovements = await prisma.movimientoInventario.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: {
        producto: true,
        usuario: true
      }
    });

    res.json({
      totalProducts,
      inventoryValue,
      lowStockAlerts: lowStockItems.length,
      lowStockItems,
      recentMovements
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};
