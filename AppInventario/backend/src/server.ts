import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'reflect-metadata';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import userRoutes from './routes/user.routes';
import purchaseRoutes from './routes/purchase.routes';
import providerRoutes from './routes/provider.routes';
import dashboardRoutes from './routes/dashboard.routes';
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/report.routes';
import { authenticateToken, authorizeRoles } from './middlewares/auth.middleware';

app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api/auth', authRoutes);

// Private/Protected Routes
// ALL authenticated users can see the dashboard (Audit, Purchase, Almacen)
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Strict Role Bindings
app.use('/api/products', authenticateToken, authorizeRoles('ALMACEN', 'COMPRADOR'), productRoutes);
app.use('/api/inventory', authenticateToken, authorizeRoles('ALMACEN'), inventoryRoutes);
app.use('/api/purchases', authenticateToken, authorizeRoles('COMPRADOR'), purchaseRoutes);
app.use('/api/providers', authenticateToken, authorizeRoles('COMPRADOR'), providerRoutes);
app.use('/api/reports', authenticateToken, authorizeRoles('AUDITOR'), reportRoutes);

// Only ADMIN can hit the user management endpoints
app.use('/api/users', authenticateToken, authorizeRoles('ADMIN'), userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Sistema Inventario Backend Running!');
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
