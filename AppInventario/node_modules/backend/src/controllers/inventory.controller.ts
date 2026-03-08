import { Request, Response } from 'express';
import prisma from '../db';
import { TipoMovimiento } from '@prisma/client';

export const registerMovement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, cantidad, productoId, loteId, almacenOrigenId, almacenDestinoId, usuarioId } = req.body;
    
    const parsedCantidad = parseInt(cantidad.toString(), 10);
    const parsedProductoId = parseInt(productoId.toString(), 10);
    const parsedUsuarioId = parseInt(usuarioId.toString(), 10);
    
    // We perform a transaction to update stock and register movement
    await prisma.$transaction(async (tx) => {
      // 1. Create the Movement Record
      const movement = await tx.movimientoInventario.create({
        data: {
          tipo: tipo as TipoMovimiento,
          cantidad: parsedCantidad,
          productoId: parsedProductoId,
          loteId: loteId ? parseInt(loteId.toString(), 10) : null,
          almacenOrigenId: almacenOrigenId ? parseInt(almacenOrigenId.toString(), 10) : null,
          almacenDestinoId: almacenDestinoId ? parseInt(almacenDestinoId.toString(), 10) : null,
          usuarioId: parsedUsuarioId,
        },
      });

      // 2. Logic to handle Stock
      let targetLoteId = loteId ? parseInt(loteId.toString(), 10) : null;
      
      if (!targetLoteId) {
        // Find existing Lote for this product
        const existingLote = await tx.lote.findFirst({
          where: { productoId: parsedProductoId }
        });
        
        if (existingLote) {
           targetLoteId = existingLote.id;
        } else if (tipo === TipoMovimiento.ENTRADA || tipo === TipoMovimiento.AJUSTE) {
           // Create a new Lote if none exists and we are adding stock
           const newLote = await tx.lote.create({
             data: {
               numeroLote: `LOTE-${parsedProductoId}-DEFAULT`,
               cantidadDisponible: 0,
               productoId: parsedProductoId
             }
           });
           targetLoteId = newLote.id;
        }
      }

      if (targetLoteId) {
        if (tipo === TipoMovimiento.ENTRADA || tipo === TipoMovimiento.DEVOLUCION || tipo === TipoMovimiento.AJUSTE) {
          await tx.lote.update({
            where: { id: targetLoteId },
            data: { cantidadDisponible: { increment: parsedCantidad } },
          });
        } else if (tipo === TipoMovimiento.SALIDA) {
          await tx.lote.update({
            where: { id: targetLoteId },
            data: { cantidadDisponible: { decrement: parsedCantidad } },
          });
        }
        
        // Link movement to Lote
        await tx.movimientoInventario.update({
          where: { id: movement.id },
          data: { loteId: targetLoteId }
        });
      }

      return movement;
    });
    
    res.status(201).json({ message: 'Movement registered successfully' });
  } catch (error) {
    console.error('Error registering movement:', error);
    res.status(500).json({ error: 'Failed to register movement' });
  }
};

export const getMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const movements = await prisma.movimientoInventario.findMany({
      include: {
        producto: true,
        usuario: true,
        lote: true,
      },
      orderBy: { timestamp: 'desc' },
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
};
