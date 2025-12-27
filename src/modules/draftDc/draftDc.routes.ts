import { Router } from 'express';
import {getAllDraftDcs, getDraftDcById, createDraftDc, updateDraftDc, deleteDraftDc, getDraftDcDetails} from './draftDc.controller';
import { authMiddleware } from '../../shared/middleware/authControl';
import { get } from 'http';

const router = Router();

// All routes require authentication
router.use(authMiddleware);


router.get('/details', getDraftDcDetails);
router.get('/', getAllDraftDcs);;
router.get('/:id', getDraftDcById);
router.post('/', createDraftDc);
router.put('/:id', updateDraftDc);
router.delete('/:id', deleteDraftDc);

export default router;
