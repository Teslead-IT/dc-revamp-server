import { Router } from 'express';
import { getAllDraftDcItems, createDraftDcItem} from './draftDcItems.controller';
import { authMiddleware } from '../../shared/middleware/authControl';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllDraftDcItems);
// router.get('/:id', getSupplierById);
router.post('/', createDraftDcItem);
// router.put('/:id', updateSupplier);
// router.delete('/:id', deleteSupplier);

export default router;
