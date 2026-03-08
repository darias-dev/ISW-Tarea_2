"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getProviders = exports.getOrders = void 0;
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
const getOrders = async (req, res) => {
    try {
        const orders = await db_1.default.ordenCompra.findMany({
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
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
};
exports.getOrders = getOrders;
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
const getOrderById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const order = await db_1.default.ordenCompra.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch purchase order' });
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res) => {
    try {
        const { proveedorId, items } = req.body;
        // items should be an array of { productoId, cantidad, precioUnitario }
        if (!proveedorId || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'Invalid payload: proveedorId and items are required' });
            return;
        }
        const newOrder = await db_1.default.$transaction(async (tx) => {
            const order = await tx.ordenCompra.create({
                data: {
                    proveedorId: parseInt(proveedorId.toString(), 10),
                    estado: client_1.EstadoOrden.PENDIENTE,
                    items: {
                        create: items.map((item) => ({
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
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create purchase order' });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { estado } = req.body; // PENDIENTE, APROBADA, RECIBIDA, CANCELADA
        if (!Object.values(client_1.EstadoOrden).includes(estado)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const currentOrder = await db_1.default.ordenCompra.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!currentOrder) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        // Prevent moving back from RECIBIDA or CANCELADA in a simplified logic
        if (currentOrder.estado === client_1.EstadoOrden.RECIBIDA || currentOrder.estado === client_1.EstadoOrden.CANCELADA) {
            res.status(400).json({ error: `Cannot change status of a ${currentOrder.estado} order` });
            return;
        }
        const updatedOrder = await db_1.default.$transaction(async (tx) => {
            const order = await tx.ordenCompra.update({
                where: { id },
                data: {
                    estado: estado,
                    fechaRecepcion: estado === client_1.EstadoOrden.RECIBIDA ? new Date() : currentOrder.fechaRecepcion,
                },
            });
            // If status is changed to RECIBIDA, update inventory (ENTRADA)
            if (estado === client_1.EstadoOrden.RECIBIDA) {
                // Find an admin/system user to log the movement
                let contextUserId = 1; // Default
                for (const item of currentOrder.items) {
                    await tx.movimientoInventario.create({
                        data: {
                            tipo: client_1.TipoMovimiento.ENTRADA,
                            cantidad: item.cantidad,
                            productoId: item.productoId,
                            usuarioId: contextUserId,
                            // Without lote handling for this MVP simplification, stock relies on aggregating movements or modifying Lote if needed.
                        },
                    });
                }
            }
            return order;
        });
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
