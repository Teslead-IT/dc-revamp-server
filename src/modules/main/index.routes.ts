import { Router , type Router as ExpressRouter} from 'express';
import authRoutes from '../auth/auth.routes';
import suppliersRoutes from '../suppliers/suppliers.routes';
import draftDcRoutes from '../draftDc/draftDc.routes';
import draftDcItemsRoutes from '../draftDcItems/draftDcItems.routes';
import itemsRoutes from '../items/items.routes';

const router: ExpressRouter = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/draft-dc', draftDcRoutes);
router.use('/draft-dc-items', draftDcItemsRoutes);
router.use('/items', itemsRoutes);

export default router;
