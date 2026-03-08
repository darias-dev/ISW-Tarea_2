"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovements = exports.registerMovement = void 0;
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
const registerMovement = async (req, res) => {
    try {
        const { tipo, cantidad, productoId, loteId, almacenOrigenId, almacenDestinoId, usuarioId } = req.body;
        const parsedCantidad = parseInt(cantidad.toString(), 10);
        const parsedProductoId = parseInt(productoId.toString(), 10);
        const parsedUsuarioId = parseInt(usuarioId.toString(), 10);
        // We perform a transaction to update stock and register movement
        await db_1.default.$transaction(async (tx) => {
            // 1. Create the Movement Record
            const movement = await tx.movimientoInventario.create({
                data: {
                    tipo: tipo,
                    cantidad: parsedCantidad,
                    productoId: parsedProductoId,
                    loteId: loteId ? parseInt(loteId.toString(), 10) : null,
                    almacenOrigenId: almacenOrigenId ? parseInt(almacenOrigenId.toString(), 10) : null,
                    almacenDestinoId: almacenDestinoId ? parseInt(almacenDestinoId.toString(), 10) : null,
                    usuarioId: parsedUsuarioId,
                },
            });
            // 2. Logic to handle Stock (simplified to Lote model for now)
            // Ideally, an ENTRADA adds stock to the Lote, a SALIDA removes from the Lote
            if (tipo === client_1.TipoMovimiento.ENTRADA && loteId) {
                await tx.lote.update({
                    where: { id: parseInt(loteId.toString(), 10) },
                    data: {
                        cantidadDisponible: {
                            increment: parsedCantidad,
                        },
                    },
                });
            }
            else if (tipo === client_1.TipoMovimiento.SALIDA && loteId) {
                await tx.lote.update({
                    where: { id: parseInt(loteId.toString(), 10) },
                    data: {
                        cantidadDisponible: {
                            decrement: parsedCantidad,
                        },
                    },
                });
            }
            return movement;
        });
        res.status(201).json({ message: 'Movement registered successfully' });
    }
    catch (error) {
        console.error('Error registering movement:', error);
        res.status(500).json({ error: 'Failed to register movement' });
    }
};
exports.registerMovement = registerMovement;
const getMovements = async (req, res) => {
    try {
        const movements = await db_1.default.movimientoInventario.findMany({
            include: {
                producto: true,
                usuario: true,
                lote: true,
            },
            orderBy: { timestamp: 'desc' },
        });
        res.json(movements);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch movements' });
    }
};
exports.getMovements = getMovements;
