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
    // partyId: z.string().min(1, 'Party ID is required'),
    partyName: z.string().min(1, 'Party name is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().min(1, 'Address line 2 is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    stateCode: z.number().int().positive(),
    pinCode: z.number().int().positive(),

    gstinNumber: z.preprocess(
        (val) => {
            if (val == null) return '';
            return String(val).trim().toUpperCase();
        },
        z
            .string()
            .length(15, 'GSTIN must be exactly 15 characters')
            .regex(/^[A-Z0-9]+$/, 'GSTIN must contain only letters and digits')
    ),

    email: z.string().email('Invalid email format'),
    phone: z.preprocess(
        (val) => {
            if (val == null) return '';
            const s = String(val).replace(/\D/g, '');
            return s;
        },
        z.string().length(10, 'Phone number must contain exactly 10 digits')
    ),
    createdBy: z.string(),
    updatedBy: z.string(),
});

export const partyDetailsUpdateSchema = partyDetailsCreateSchema.partial();

export const draftDCCreateSchema = z.object({
    draftId: z.string().min(1, 'Draft ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    partyId: z.string().min(1, 'Party ID is required'),
    dcDate: z.string().min(1, 'DC Date is required'),
    remarks: z.string().optional(),
    isAdmin: z.boolean().optional(),
    createdBy: z.string(),
    updatedBy: z.string(),
});
export const draftDCUpdateSchema = draftDCCreateSchema.partial();

export const draftDCItemsCreateSchema = z.object({
    draftId: z.string().min(1, 'Draft ID is required'),
    partyId: z.string().min(1, 'Party ID is required'),
    items: z.array(z.object({
        itemName: z.string().min(1, 'Item Name is required'),
        itemId: z.string().optional(),
        itemDescription: z.string().min(1, 'Item Description is required'),
        uom: z.string().min(1, 'Unit of Measure is required'),
        quantity: z.number().positive('Quantity must be a positive number'),
        weightPerUnit: z.number().min(0, 'Weight per unit must be a non-negative number'),
        totalWeight: z.number().min(0, 'Total weight must be a non-negative number'),
        ratePerEach: z.number().positive('Rate per each must be a positive number'),
        squareFeetPerUnit: z.number().min(0, 'Square feet per each must be a non-negative number'),
        totalSquareFeet: z.number().min(0, 'Total square feet must be a non-negative number'),
        remarks: z.string().min(1, 'Remarks is required'),
        projectName: z.string().min(1, 'Project Name is required'),
        projectIncharge: z.string().min(1, 'Project Incharge is required'),
        notes: z.string().min(1, 'Notes is required'),
        createdBy: z.string().optional(),
        updatedBy: z.string().optional(),
    })),
    // itemId: z.string().min(1, 'Item ID is required'),
    // itemName: z.string().min(1, 'Item Name is required'),
    // itemDescription: z.string().min(1, 'Item Description is required'),
    // uom: z.string().min(1, 'Unit of Measure is required'),
    // quantity: z.number().positive('Quantity must be a positive number'),
    // weightPerUnit: z.number().positive('Weight per unit must be a positive number'),
    // totalWeight: z.number().positive('Total weight must be a positive number'),
    // ratePerEach: z.number().positive('Rate per each must be a positive number'),
    // squareFeetPerUnit: z.number().positive('Square feet per each must be a positive number'),
    // totalSquareFeet: z.number().positive('Total square feet must be a positive number'),
    // remarks: z.string().min(1, 'Remarks is required'),
    // projectName: z.string().min(1, 'Project Name is required'),
    // projectIncharge: z.string().min(1, 'Project Incharge is required'),
    // notes: z.string().min(1, 'Notes is required'),
    // createdBy: z.string().optional(),
    // updatedBy: z.string().optional(),
});
export const draftDCItemsUpdateSchema = z.object({
    items: z.array(
        z.object({
            itemId: z.string().min(1, "Item ID is required"),

            itemName: z.string().optional(),
            itemDescription: z.string().optional(),
            uom: z.string().optional(),
            quantity: z.number().positive().optional(),
            weightPerUnit: z.number().min(0).optional(),
            totalWeight: z.number().min(0).optional(),
            ratePerEach: z.number().positive().optional(),
            squareFeetPerUnit: z.number().min(0).optional(),
            totalSquareFeet: z.number().min(0).optional(),
            remarks: z.string().optional(),
            projectName: z.string().optional(),
            projectIncharge: z.string().optional(),
            notes: z.string().optional(),

            // never client-controlled
            createdBy: z.never().optional(),
            updatedBy: z.never().optional(),
        })
    ).min(1, "At least one item must be provided"),
});


export const itemsCreateSchema = z.object({
    // standardItemId: z.string().min(1, 'Standard Item ID is required'),
    itemName: z.string().min(1, 'Item Name is required'),
});