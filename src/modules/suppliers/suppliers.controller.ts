import { Request, Response } from 'express';
import { DraftDC, PartyDetails } from '../../core/models';
import { partyDetailsCreateSchema, partyDetailsUpdateSchema } from '../../shared/validations';
import { Op } from 'sequelize';

/**
 * GET /api/suppliers
 * Get all suppliers
 */
export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        const { searchTerm } = req.query;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
            return;
        }
        if (searchTerm && typeof searchTerm === 'string') {
            const suppliers = await PartyDetails.findAll({
                where: {
                    partyName: {
                        [Op.iLike]: `%${searchTerm}%`
                    }
                }
            });

            res.status(200).json({
                success: true,
                message: suppliers.length > 0 ? 'Suppliers found' : 'No suppliers found',
                data: { suppliers },
            });
            return;
        }

        const suppliers = await PartyDetails.findAll();

        res.status(200).json({
            success: true,
            message: suppliers.length > 0 ? 'Suppliers found' : 'No suppliers found',
            data: { suppliers },
        });
    } catch (error: any) {
        console.error('Fetch suppliers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch suppliers',
            error: error.message,
        });
    }
};

/**
 * GET /api/suppliers/:id
 * Get supplier by ID
 */
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const supplier = await PartyDetails.findOne({
            where: { partyId: id },
        });

        if (!supplier) {
            res.status(404).json({
                success: false,
                message: 'Supplier not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Supplier found',
            data: { supplier },
        });
    } catch (error: any) {
        console.error('Fetch supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch supplier',
            error: error.message,
        });
    }
};

/**
 * POST /api/suppliers
 * Create new supplier
 */
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
    try {


        const validation = partyDetailsCreateSchema.safeParse({
            ...req.body,
            createdBy: req.auth?.userId || 'system',
            updatedBy: req.auth?.userId || 'system',
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

        const phoneNumber = validation.data.phone;

        const cleanedPhone = String(phoneNumber).replace(/\D/g, '');

        const last4 = cleanedPhone.slice(-4);
        const rand = Math.floor(100 + Math.random() * 900);



        const partyId = `SUP-${last4}-${rand}`;

        const saveData = { ...validation.data, partyId };


        const supplier = await PartyDetails.create(saveData);

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: { supplier },
        });
    } catch (error: any) {
        console.error('Create supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create supplier',
            error: error.message,
        });
    }
};

/**
 * PUT /api/suppliers/:id
 * Update supplier
 */
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const supplier = await PartyDetails.findOne({
            where: { partyId: id }
        });

        if (!supplier) {
            res.status(404).json({
                success: false,
                message: 'Supplier not found',
            });
            return;
        }

        const validation = partyDetailsUpdateSchema.safeParse({
            ...req.body,
            updatedBy: req.auth?.userId || 'system',
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

        await supplier.update(validation.data);

        res.status(200).json({
            success: true,
            message: 'Supplier updated successfully',
            data: { supplier },
        });
    } catch (error: any) {
        console.error('Update supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update supplier',
            error: error.message,
        });
    }
};

/**
 * DELETE /api/suppliers/:id
 * Delete supplier (soft delete)
 */
export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const supplier = await PartyDetails.findOne({
            where: { partyId: id },

        });

        if (!supplier) {
            res.status(404).json({
                success: false,
                message: 'Supplier not found',
            });
            return;
        }

        await supplier.destroy();

        const drafts = await DraftDC.findAll({
            where: { partyId: id },
        });

        for (const draft of drafts) {
            await draft.update({
                supplierSnapshot: {
                    ...draft.supplierSnapshot,
                    deletedStatus: true,
                }
            });
        }


        res.status(200).json({
            success: true,
            message: 'Supplier deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete supplier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete supplier',
            error: error.message,
        });
    }
};
