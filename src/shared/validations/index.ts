import { z } from 'zod';

// User validation schemas
export const userCreateSchema = z.object({
    userId: z.string().min(3, 'User ID must be at least 3 characters').max(50),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['super_admin', 'admin', 'user']).default('user'),
});

export const loginSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    password: z.string().min(1, 'Password is required'),
});

// Party Details validation schemas
export const partyDetailsCreateSchema = z.object({
    partyId: z.number().int().positive(),
    partyName: z.string().min(1, 'Party name is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().min(1, 'Address line 2 is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    stateCode: z.number().int().positive(),
    pinCode: z.number().int().positive(),
    gstinNumber: z.string().min(15, 'GSTIN must be 15 characters').max(15),
    email: z.string().email('Invalid email format'),
    phone: z.number().int().positive(),
    createdBy: z.string(),
    updatedBy: z.string(),
});

export const partyDetailsUpdateSchema = partyDetailsCreateSchema.partial();
