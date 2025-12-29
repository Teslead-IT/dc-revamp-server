import { Request, Response } from 'express';
import { User } from '../../core/models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/middleware/authControl';
import { loginSchema, userCreateSchema } from '../../shared/validations';

/**
 * POST /api/auth/login
 * User login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            const errors = validation.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
            return;
        }

        const { userId, password } = validation.data;

        const user = await User.findOne({ where: { userId } });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'User account is inactive',
            });
            return;
        }

        const isPasswordValid = await user.validatePassword(password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        const tokenPayload = {
            id: user.id.toString(),
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    userId: user.userId,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * POST /api/auth/setup
 * Create first super admin (only if no users exist)
 */
export const setup = async (req: Request, res: Response): Promise<void> => {
    try {
        // const userCount = await User.count();
        const userCount = await User.findOne({
            where: { role: 'super_admin' }
        });

        if (userCount) {
            res.status(403).json({
                success: false,
                message: 'Users already exist. Use /api/auth/create-user endpoint instead.',
            });
            return;
        }

        const validation = userCreateSchema.safeParse({
            ...req.body,
            role: 'super_admin',
        });

        if (!validation.success) {
            const errors = validation.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
            return;
        }

        const user = await User.create({
            userId: validation.data.userId,
            email: validation.data.email,
            password: validation.data.password,
            name: validation.data.name,
            role: 'super_admin',
            isActive: true,
        });

        const userResponse = user.toJSON();
        delete (userResponse as any).password;

        res.status(201).json({
            success: true,
            message: 'Super Admin created successfully',
            data: { user: userResponse },
        });
    } catch (error: any) {
        console.error('Setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create super-admin user',
            error: error.message,
        });
    }
};

/**
 * POST /api/auth/create-user
 * Create new user (requires admin/super_admin role)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = userCreateSchema.safeParse(req.body);

        if (!validation.success) {
            const errors = validation.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
            return;
        }

        // Check if userId already exists
        const existingUser = await User.findOne({
            where: { userId: validation.data.userId },
        });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User ID already exists',
            });
            return;
        }

        // Check if email already exists
        const existingEmail = await User.findOne({
            where: { email: validation.data.email },
        });

        if (existingEmail) {
            res.status(409).json({
                success: false,
                message: 'Email already exists',
            });
            return;
        }

        // Admin can only create regular users
        if (req.auth?.role === 'admin' && validation.data.role !== 'user') {
            res.status(403).json({
                success: false,
                message: 'Admins can only create users with "user" role',
            });
            return;
        }

        const user = await User.create({
            userId: validation.data.userId,
            email: validation.data.email,
            password: validation.data.password,
            name: validation.data.name,
            role: validation.data.role,
            isActive: true,
        });

        const userResponse = user.toJSON();
        delete (userResponse as any).password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user: userResponse },
        });
    } catch (error: any) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message,
        });
    }
};

/**
 * POST /api/auth/verify-user
 * Verify if a user exists
 */
export const verifyUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
            return;
        }

        const user = await User.findOne({
            where: { userId },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'User verified',
            data: {
                id: user.id,
                userId: user.userId,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Verify user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * GET /api/auth/session
 * Get current user session
 * Protected route - requires authentication
 */
export const getSession = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.auth is populated by authMiddleware
        if (!req.auth) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        // Fetch fresh user data from database
        const user = await User.findOne({
            where: { userId: req.auth.userId },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'User account is inactive',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Session retrieved successfully',
            data: {
                user: {
                    id: user.id,
                    userId: user.userId,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error: any) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve session',
            error: error.message,
        });
    }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token required',
            });
            return;
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
            return;
        }

        // Fetch user to ensure they still exist and are active
        const user = await User.findOne({
            where: { userId: decoded.userId },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'User account is inactive',
            });
            return;
        }

        // Generate new tokens
        const tokenPayload = {
            id: user.id.toString(),
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: {
                    id: user.id,
                    userId: user.userId,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        });
    } catch (error: any) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
            error: error.message,
        });
    }
};

/**
 * POST /api/auth/logout
 * Logout user (optional server-side cleanup)
 * Protected route - requires authentication
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.auth is populated by authMiddleware
        if (!req.auth) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        // Log logout activity
        console.log(`User ${req.auth.userId} logged out at ${new Date().toISOString()}`);

        // Optional: Add token to blacklist (requires Redis or database implementation)
        // const token = extractToken(req);
        // await blacklistToken(token);

        // Optional: Delete refresh tokens from database
        // await RefreshToken.destroy({ where: { userId: req.auth.userId } });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout',
            error: error.message,
        });
    }
};
