import { Router } from 'express';
import authRoutes from '../auth/auth.routes';
import suppliersRoutes from '../suppliers/suppliers.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/suppliers', suppliersRoutes);

export default router;
