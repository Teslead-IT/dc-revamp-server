import { Router, type Router as ExpressRouter } from 'express';
import {getTableLayout, saveTableLayout} from './tableLayouts.controller';
import { authMiddleware } from '../../shared/middleware/authControl';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/table/:tableKey', getTableLayout);
router.post('/table/:tableKey', saveTableLayout);


export default router;
