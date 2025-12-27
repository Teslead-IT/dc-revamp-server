import { Router, type Router as ExpressRouter } from 'express';
import { getAllDraftDcItems, getDraftDcItemById, createDraftDcItem, updateDraftDcItems, deleteDraftDcItem} from './draftDcItems.controller';
import { authMiddleware } from '../../shared/middleware/authControl';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllDraftDcItems);
router.get('/:id', getDraftDcItemById);
router.post('/', createDraftDcItem);
router.put('/:id', updateDraftDcItems);
router.delete('/:id', deleteDraftDcItem);

export default router;
