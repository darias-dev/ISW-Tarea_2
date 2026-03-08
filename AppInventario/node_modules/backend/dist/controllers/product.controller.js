"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.createProduct = exports.getProducts = void 0;
const db_1 = __importDefault(require("../db"));
const getProducts = async (req, res) => {
    try {
        const products = await db_1.default.producto.findMany({
            include: {
                categoria: true,
                proveedor: true,
            },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, unidad, precio, categoriaId, proveedorId } = req.body;
        const newProduct = await db_1.default.producto.create({
            data: {
                nombre,
                descripcion,
                unidad,
                precio: parseFloat(precio.toString()),
                categoriaId: parseInt(categoriaId.toString(), 10),
                proveedorId: proveedorId ? parseInt(proveedorId.toString(), 10) : null,
            },
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const getProductById = async (req, res) => {
    try {
        const sku = req.params.id;
        const product = await db_1.default.producto.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const skuParam = req.params.id;
        const { nombre, descripcion, unidad, precio, categoriaId, proveedorId } = req.body;
        // Check if product exists before updating
        const existingProduct = await db_1.default.producto.findUnique({ where: { sku: parseInt(skuParam, 10) } });
        if (!existingProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const updatedProduct = await db_1.default.producto.update({
            where: { sku: parseInt(skuParam, 10) },
            data: {
                nombre,
                descripcion,
                unidad,
                precio: precio !== undefined ? parseFloat(precio.toString()) : undefined,
                categoriaId: categoriaId ? parseInt(categoriaId.toString(), 10) : undefined,
                proveedorId: proveedorId ? parseInt(proveedorId.toString(), 10) : null,
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const skuParam = req.params.id;
        // Check if product exists
        const existingProduct = await db_1.default.producto.findUnique({ where: { sku: parseInt(skuParam, 10) } });
        if (!existingProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        await db_1.default.producto.delete({
            where: { sku: parseInt(skuParam, 10) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
