import { createServer } from 'http';
import { pgConnect } from './shared/db/postgres';
import { initializeModels, initializeAssociations, syncDatabase } from './core/models';
import { logger } from './shared/utils/logger';
import env from './shared/utils/env';
import app from './app';
import http from 'http';

// Node agent tuning
http.globalAgent.maxSockets = Infinity;
http.globalAgent.maxFreeSockets = 20000;

const initializeServer = async () => {
    try {
        logger.info('🚀 Starting server initialization...');
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`DB_SYNC: ${env.DB_SYNC}`);
        logger.info(`DATABASE_URL present: ${!!env.DATABASE_URL}`);

        // Connect to database
        const sequelize = await pgConnect();
        logger.info('✅ Database connected successfully');

        // Initialize models (REQUIRED - these define the ORM structure)
        logger.info('📦 Initializing models...');
        initializeModels(sequelize);
        initializeAssociations();
        logger.info('✅ Models initialized');

        // Sync database (optional - controlled by DB_SYNC env variable)
        // OR auto-sync in production if tables don't exist (first deployment)
        if (env.DB_SYNC) {
            logger.info('🔁 Starting database sync (DB_SYNC=true)...');
            // alter: true - Safely updates schema without dropping tables
            // WARNING: Never use force: true in production (it deletes all data)
            await syncDatabase({ alter: true });
            logger.info('✅ Database synced successfully');
        } else {
            logger.info('⚠️  DB_SYNC is false, checking if tables exist...');
            // Check if tables exist, if not, auto-sync (important for first deploy)
            try {
                await sequelize.query('SELECT 1 FROM users LIMIT 1');
                logger.info('✅ Database sync skipped (tables exist)');
            } catch (error) {
                logger.warn('⚠️  Tables not found, auto-syncing database...');
                logger.warn(`Error details: ${error instanceof Error ? error.message : error}`);
                await syncDatabase({ alter: true });
                logger.info('✅ Database auto-synced successfully');
            }
        }

        logger.info('🎉 Database initialization complete!');

        // Create HTTP server
        const server = createServer(app);

        // Set server options
        server.maxConnections = 60000;
        server.keepAliveTimeout = 60000;
        server.headersTimeout = 65000;
        server.requestTimeout = 60000;

        // Define port and base URL
        const PORT = env.PORT || 3011;
        const BASE_URL = env.BASE_URL || `http://localhost:${PORT}`;

        // Start server
        server.listen(PORT, () => {
            logger.info(`🚀 Server running on ${BASE_URL}`);
            logger.info(`Environment: ${env.NODE_ENV}`);
        });

        // Handle server errors
        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
            logger.error(`Server error: ${error.message}`);
        });

        // Global error handlers
        process.on('uncaughtException', (error: Error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            logger.error('Unhandled Rejection:', { reason, promise });
            process.exit(1);
        });

        // Graceful shutdown
        const gracefulShutdown = () => {
            logger.info('Received shutdown signal. Closing server...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        return server;
    } catch (error) {
        logger.error('Server startup failed:', error);
        process.exit(1);
    }
};

// Start the server
initializeServer().catch((error) => {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
});
