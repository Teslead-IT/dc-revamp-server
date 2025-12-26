import { Router } from 'express';
import authRoutes from '../auth/auth.routes';
import suppliersRoutes from '../suppliers/suppliers.routes';
import draftDcRoutes from '../draftDc/draftDc.routes';
import draftDcItemsRoutes from '../draftDcItems/draftDcItems.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/draft-dc', draftDcRoutes);
router.use('/draft-dc-items', draftDcItemsRoutes);

export default router;
