"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProviderById = exports.getProviders = void 0;
const db_1 = __importDefault(require("../db"));
const getProviders = async (req, res) => {
    try {
        const providers = await db_1.default.proveedor.findMany({
            orderBy: { nombre: 'asc' },
        });
        res.json(providers);
    }
    catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
};
exports.getProviders = getProviders;
const getProviderById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const provider = await db_1.default.proveedor.findUnique({
            where: { id },
        });
        if (!provider) {
            res.status(404).json({ error: 'Provider not found' });
            return;
        }
        res.json(provider);
    }
    catch (error) {
        console.error('Error fetching provider:', error);
        res.status(500).json({ error: 'Failed to fetch provider details' });
    }
};
exports.getProviderById = getProviderById;
const createProvider = async (req, res) => {
    try {
        const { nombre, contacto, condicionesPago } = req.body;
        if (!nombre) {
            res.status(400).json({ error: 'Field "nombre" is required' });
            return;
        }
        const newProvider = await db_1.default.proveedor.create({
            data: {
                nombre,
                contacto,
                condicionesPago,
            },
        });
        res.status(201).json(newProvider);
    }
    catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ error: 'Failed to create provider' });
    }
};
exports.createProvider = createProvider;
const updateProvider = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nombre, contacto, condicionesPago } = req.body;
        const existingProvider = await db_1.default.proveedor.findUnique({ where: { id } });
        if (!existingProvider) {
            res.status(404).json({ error: 'Provider not found' });
            return;
        }
        const updatedProvider = await db_1.default.proveedor.update({
            where: { id },
            data: {
                nombre,
                contacto,
                condicionesPago,
            },
        });
        res.json(updatedProvider);
    }
    catch (error) {
        console.error('Error updating provider:', error);
        res.status(500).json({ error: 'Failed to update provider' });
    }
};
exports.updateProvider = updateProvider;
const deleteProvider = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existingProvider = await db_1.default.proveedor.findUnique({
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
        await db_1.default.proveedor.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting provider:', error);
        res.status(500).json({ error: 'Failed to delete provider' });
    }
};
exports.deleteProvider = deleteProvider;
