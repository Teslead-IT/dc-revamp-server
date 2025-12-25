import { Sequelize } from 'sequelize';
import env from '../utils/env';
import { logger } from '../utils/logger';

let sequelize: Sequelize | null = null;

export const pgConnect = async (): Promise<Sequelize> => {
    if (sequelize) {
        return sequelize;
    }

    console.log("postgresql connection", env.DB_PASSWORD, env.DB_USER, env.DB_HOST, env.DB_PORT, env.DB_NAME);

    try {
        sequelize = new Sequelize({
            host: env.DB_HOST,
            port: env.DB_PORT,
            database: env.DB_NAME,
            username: env.DB_USER,
            password: env.DB_PASSWORD,
            dialect: 'postgres',
            logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
            pool: {
                max: 20,
                min: 0,
                acquire: 60000,
                idle: 10000,
            },
            dialectOptions: {
                connectTimeout: 60000,
            },
        });

        await sequelize.authenticate();
        logger.info('✅ PostgreSQL connected successfully');

        return sequelize;
    } catch (error) {
        logger.error('❌ PostgreSQL connection failed:', error);
        throw error;
    }
};

export const getSequelize = (): Sequelize | null => {
    return sequelize;
};

export default sequelize;
