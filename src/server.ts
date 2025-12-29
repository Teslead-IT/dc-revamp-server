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
        // Connect to database
        const sequelize = await pgConnect();
        logger.info('Database connected successfully');

        // Initialize models (REQUIRED - these define the ORM structure)
        initializeModels(sequelize);
        initializeAssociations();
        logger.info('✅ Models initialized');

        // Sync database (optional - controlled by DB_SYNC env variable)
        if (env.DB_SYNC) {
            logger.info('🔁 Starting database sync...');
            await syncDatabase({ alter: true, force: true });
            logger.info('✅ Database synced successfully');
        } else {
            logger.info('⏭️  Database sync skipped (DB_SYNC=false)');
        }

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
