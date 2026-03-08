import { Router } from 'express';
import { getInventoryReport, getLowStockReport } from '../controllers/report.controller';

const router = Router();

router.get('/inventory', getInventoryReport);
router.get('/low-stock', getLowStockReport);

export default router;
