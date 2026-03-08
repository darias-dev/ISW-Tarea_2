import { Router } from 'express';
import { registerMovement, getMovements } from '../controllers/inventory.controller';

const router = Router();

router.get('/movement', getMovements);
router.post('/movement', registerMovement);

export default router;
