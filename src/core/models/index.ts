import { Sequelize } from 'sequelize';
import User, { initializeUserModel } from './user.model';
import PartyDetails, { initializePartyDetailsModel } from './partyDetails.model';
import DraftDC, { initializeDraftDCModel } from './draftDcDetails.model';
import { DraftDCItems, initializeDraftDCItemsModel } from './draftDcItems.model';
import { logger } from '../../shared/utils/logger';

type SyncOptions = {
    alter?: boolean;
    force?: boolean;
};

let isInitialized = false;

export function initializeModels(sequelize: Sequelize) {
    if (isInitialized) {
        return;
    }

    initializeUserModel(sequelize);
    initializePartyDetailsModel(sequelize);
    initializeDraftDCModel(sequelize);
    initializeDraftDCItemsModel(sequelize);

    isInitialized = true;
    logger.info('✅ Models initialized');
}

export function initializeAssociations() {
    // Define associations here when needed
    // Example: User.hasMany(DraftDC, { foreignKey: 'createdBy', as: 'drafts' });
}

export async function syncDatabase(options: SyncOptions = { alter: true }) {
    try {
        logger.info('🔁 Starting database sync...');

        await User.sync(options);
        logger.info('✅ User table synced');

        await PartyDetails.sync(options);
        logger.info('✅ PartyDetails table synced');

        await DraftDC.sync(options);
        logger.info('✅ DraftDC table synced');

        await DraftDCItems.sync(options);
        logger.info('✅ DraftDCItems table synced');

        logger.info('🎉 Database sync completed');
    } catch (error) {
        logger.error('❌ Database sync failed:', error);
        throw error;
    }
}

export { User, PartyDetails, DraftDC, DraftDCItems };
