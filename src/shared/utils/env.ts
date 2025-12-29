import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from dc-server/.env
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    BASE_URL: string;
    DATABASE_URL: string | undefined; // Supabase connection string (priority)
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_SYNC: boolean;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGIN: string;
}

const env: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3011', 10),
    BASE_URL: process.env.BASE_URL || 'http://localhost:3011',
    // Supabase connection string (if provided, this takes priority)
    DATABASE_URL: process.env.DATABASE_URL,
    // Individual DB params (fallback if DATABASE_URL not provided)
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME || 'delivery_challan',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_SYNC: process.env.DB_SYNC === 'true', // Default to false for safety
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

export default env;
