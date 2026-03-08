import { Request, Response } from 'express';
import prisma from '../db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.producto.findMany({
      include: {
        categoria: true,
        proveedor: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, unidad, precio, stockMinimo, categoriaId, proveedorId } = req.body;
    const newProduct = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        unidad,
        precio: parseFloat(precio.toString()),
        stockMinimo: stockMinimo !== undefined ? parseInt(stockMinimo.toString(), 10) : 10,
        categoriaId: parseInt(categoriaId.toString(), 10),
        proveedorId: proveedorId ? parseInt(proveedorId.toString(), 10) : null,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const sku = req.params.id as string;
    const product = await prisma.producto.findUnique({
      where: { sku: parseInt(sku, 10) },
      include: {
        categoria: true,
        proveedor: true,
      },
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const skuParam = req.params.id as string;
    const { nombre, descripcion, unidad, precio, stockMinimo, categoriaId, proveedorId } = req.body;
    
    // Check if product exists before updating
    const existingProduct = await prisma.producto.findUnique({ where: { sku: parseInt(skuParam, 10) } });
    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updatedProduct = await prisma.producto.update({
      where: { sku: parseInt(skuParam, 10) },
      data: {
        nombre,
        descripcion,
        unidad,
        precio: precio !== undefined ? parseFloat(precio.toString()) : undefined,
        stockMinimo: stockMinimo !== undefined ? parseInt(stockMinimo.toString(), 10) : undefined,
        categoriaId: categoriaId ? parseInt(categoriaId.toString(), 10) : undefined,
        proveedorId: proveedorId ? parseInt(proveedorId.toString(), 10) : null,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const skuParam = req.params.id as string;
    
    // Check if product exists
    const existingProduct = await prisma.producto.findUnique({ where: { sku: parseInt(skuParam, 10) } });
    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await prisma.producto.delete({
      where: { sku: parseInt(skuParam, 10) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
