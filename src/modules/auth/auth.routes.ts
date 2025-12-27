import { Router, type Router as ExpressRouter } from 'express';
import { login, setup, createUser, verifyUser, getSession, refreshToken, logout } from './auth.controller';
import { authMiddleware, checkRole } from '../../shared/middleware/authControl';

const router: ExpressRouter = Router();

// Public routes
router.post('/login', login);
router.post('/setup', setup);
router.post('/verify-user', verifyUser);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/session', authMiddleware, getSession);
router.post('/logout', authMiddleware, logout);
router.post('/create-user', authMiddleware, checkRole(['admin', 'super_admin']), createUser);

export default router;
