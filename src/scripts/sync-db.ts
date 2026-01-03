
import { pgConnect } from '../shared/db/postgres';
import { initializeModels, initializeAssociations, syncDatabase } from '../core/models';
import { logger } from '../shared/utils/logger';
import env from '../shared/utils/env';

const runSync = async () => {
    try {
        logger.info('🚀 Starting database sync script...');

        // Connect to database
        const sequelize = await pgConnect();
        logger.info('✅ Database connected');

        // Initialize models
        initializeModels(sequelize);
        initializeAssociations();
        logger.info('✅ Models initialized');

        // Sync database
        // We use alter: true to update schema without data loss
        await syncDatabase({ alter: true });

        logger.info('✨ Database sync script completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Database sync failed:', error);
        process.exit(1);
    }
};

runSync();
