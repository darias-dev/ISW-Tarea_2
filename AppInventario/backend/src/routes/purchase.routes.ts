import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus, getProviders } from '../controllers/purchase.controller';

const router = Router();

router.get('/providers', getProviders);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
