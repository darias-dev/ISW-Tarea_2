import { Request, Response } from 'express';
import prisma from '../db';

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

export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const provider = await prisma.proveedor.findUnique({
      where: { id },
    });

    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    res.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider details' });
  }
};

export const createProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, contacto, condicionesPago } = req.body;
    
    if (!nombre) {
      res.status(400).json({ error: 'Field "nombre" is required' });
      return;
    }

    const newProvider = await prisma.proveedor.create({
      data: {
        nombre,
        contacto,
        condicionesPago,
      },
    });

    res.status(201).json(newProvider);
  } catch (error) {
    console.error('Error creating provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
};

export const updateProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { nombre, contacto, condicionesPago } = req.body;

    const existingProvider = await prisma.proveedor.findUnique({ where: { id } });
    if (!existingProvider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    const updatedProvider = await prisma.proveedor.update({
      where: { id },
      data: {
        nombre,
        contacto,
        condicionesPago,
      },
    });

    res.json(updatedProvider);
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ error: 'Failed to update provider' });
  }
};

export const deleteProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const existingProvider = await prisma.proveedor.findUnique({ 
      where: { id },
      include: {
        productos: true,
        ordenesCompra: true
      }
    });

    if (!existingProvider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    // Safety check constraint manually (In Prisma P2003 usually triggers too, but returning a nice message here)
    if (existingProvider.productos.length > 0 || existingProvider.ordenesCompra.length > 0) {
      res.status(400).json({ 
        error: 'Cannot delete provider because they are assigned to existing products or purchase orders.' 
      });
      return;
    }

    await prisma.proveedor.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ error: 'Failed to delete provider' });
  }
};
