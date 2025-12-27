import express, { NextFunction, Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './shared/utils/env';
import { logger } from './shared/utils/logger';
import mainRouter from './modules/main/index.routes';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use(async (req: Request, res: Response, next: NextFunction) => {
    const time = new Date().getTime();
    logger.info(`Incoming request: ${req.method} ${req.url}`);

    res.on('finish', () => {
        logger.info(
            `Request completed: ${req.method} ${req.url} - ${res.statusCode} in ${new Date().getTime() - time}ms`
        );
    });

    next();
});

// CORS
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        allowedHeaders: ['Content-Type', 'Authorization'],
        maxAge: 3600,
    })
);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'DC Server API',
        version: '1.0.0',
    });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
    });
});

// API Routes
app.use('/api', mainRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
