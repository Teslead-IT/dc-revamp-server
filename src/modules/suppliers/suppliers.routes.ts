import { Router } from 'express';
import {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
} from './suppliers.controller';
import { authMiddleware } from '../../shared/middleware/authControl';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
