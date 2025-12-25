import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../utils/env';

export interface TokenPayload {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'user';
    iat: number;
    exp: number;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            auth?: TokenPayload;
        }
    }
}

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7);
};

/**
 * Authentication Middleware
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = extractToken(req);

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'No token provided',
        });
        return;
    }

    const payload = verifyToken(token);

    if (!payload) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
        return;
    }

    req.auth = payload;
    next();
};

/**
 * Role-based Access Control
 */
export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.auth) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        if (!allowedRoles.includes(req.auth.role)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions',
            });
            return;
        }

        next();
    };
};
