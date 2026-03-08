import { Request, Response } from 'express';
import prisma from '../db';
import { EstadoOrden, TipoMovimiento } from '@prisma/client';

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.ordenCompra.findMany({
      include: {
        proveedor: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const providers = await prisma.proveedor.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const order = await prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        proveedor: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proveedorId, items } = req.body;
    
    // items should be an array of { productoId, cantidad, precioUnitario }

    if (!proveedorId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Invalid payload: proveedorId and items are required' });
      return;
    }

    const newOrder = await prisma.$transaction(async (tx: any) => {
      const order = await tx.ordenCompra.create({
        data: {
          proveedorId: parseInt(proveedorId.toString(), 10),
          estado: EstadoOrden.PENDIENTE,
          items: {
            create: items.map((item: any) => ({
              productoId: parseInt(item.productoId.toString(), 10),
              cantidad: parseInt(item.cantidad.toString(), 10),
              precioUnitario: parseFloat(item.precioUnitario.toString()),
            })),
          },
        },
        include: {
          items: true,
        },
      });
      return order;
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { estado } = req.body; // PENDIENTE, APROBADA, RECIBIDA, CANCELADA

    if (!Object.values(EstadoOrden).includes(estado as EstadoOrden)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const currentOrder = await prisma.ordenCompra.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!currentOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Prevent moving back from RECIBIDA or CANCELADA in a simplified logic
    if (currentOrder.estado === EstadoOrden.RECIBIDA || currentOrder.estado === EstadoOrden.CANCELADA) {
      res.status(400).json({ error: `Cannot change status of a ${currentOrder.estado} order` });
      return;
    }

    const updatedOrder = await prisma.$transaction(async (tx: any) => {
      const order = await tx.ordenCompra.update({
        where: { id },
        data: {
          estado: estado as EstadoOrden,
          fechaRecepcion: estado === EstadoOrden.RECIBIDA ? new Date() : currentOrder.fechaRecepcion,
        },
      });

      // If status is changed to RECIBIDA, update inventory (ENTRADA)
      if (estado === EstadoOrden.RECIBIDA) {
        // Find an admin/system user to log the movement
        let contextUserId = 1; // Default
        
        for (const item of currentOrder.items) {
          // Auto-resolve or create Lote for this arriving shipment
          let targetLote = await tx.lote.findFirst({ where: { productoId: item.productoId } });
          if (!targetLote) {
             targetLote = await tx.lote.create({
               data: {
                 numeroLote: `LOTE-COMPRA-${currentOrder.id}-${item.productoId}`,
                 cantidadDisponible: 0,
                 productoId: item.productoId
               }
             });
          }
          
          await tx.lote.update({
            where: { id: targetLote.id },
            data: { cantidadDisponible: { increment: item.cantidad } }
          });

          await tx.movimientoInventario.create({
            data: {
              tipo: TipoMovimiento.ENTRADA,
              cantidad: item.cantidad,
              productoId: item.productoId,
              usuarioId: contextUserId,
              loteId: targetLote.id
            },
          });
        }
      }

      return order;
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
