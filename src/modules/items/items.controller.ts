import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Items } from '../../core/models/index';
import { itemsCreateSchema } from '../../shared/validations/index';
import { addSingleItem } from '../../shared/helperFunctions/itemSearchText';
import { normalizeSearch } from '../../shared/helperFunctions/itemSearchText';


export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.id ?? req.auth?.userId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }
        const { search, limit = 10 } = req.query;

        const page = parseInt(req.query.page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const offsetNum = (page - 1) * limitNum;

        const whereClause: any = {};

        if (search && (search as string).trim().length >= 2) {
            const normalized = normalizeSearch(search as string);
            whereClause.searchText = {
                [Op.like]: `%${normalized}%`,
            };
        }
        const { rows, count } = await Items.findAndCountAll({
            where: whereClause,
            limit: limitNum,
            offset: offsetNum,
            order: [['itemName', 'ASC']],
        });

        res.status(200).json({
            success: true,
            message: 'Items fetched successfully',
            total: count,
            page,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching items',
            error: error instanceof Error ? error.message : error,
        });
    }
}

export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        const { id } = req.params;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Item ID is required"
            });
            return;
        }
        const item = await Items.findOne({
            where: { standardItemId: id },
        });
        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Item not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Item fetched successfully',
            data: item,
        });
    }
    catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching item',
            error: error instanceof Error ? error.message : error,
        });
    }
}













export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.query.userId ?? req.auth?.userId;
        const data = req.body;


        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }



        const validation = itemsCreateSchema.safeParse(data);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: validation.error.message || 'Validation failed',
                errors: validation.error.errors,
            });
            return;
        }

      


        const result = await addSingleItem(data, "add");

        if (!result.success) {
            res.status(409).json({
                success: false,
                message: 'Item already exists',
            });
            return;
        }


        // const newItem = await Items.create({
        //     standardItemId: "",
        //     itemName: data.itemName,
        //     searchText: ""
        // });

        // newItem.standardItemId = `STDIT-${newItem.id.toString().padStart(6, '0')}`;
        // await newItem.save();


        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: result.data,
        });

    }
    catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating item',
            error: error instanceof Error ? error.message : error,
        });
    }
}

export const updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        const itemId = req.params.id;
        const data = req.body;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }
        if (!itemId) {
            res.status(400).json({
                success: false,
                message: "Item ID is required"
            });
            return;
        }

        const validation = itemsCreateSchema.safeParse(data);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: validation.error.message || 'Validation failed',
                errors: validation.error.errors,
            });
            return;
        }
        const item = await Items.findOne({
            where: { standardItemId: itemId },
        });

        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Item not found',
            });
            return;
        }

        const result = await addSingleItem( data, "update" , itemId);

        if (!result.success) {
            res.status(409).json({
                success: false,
                message: 'Item already exists',
            });
            return;
        }

        item.itemName = data.itemName;
        await item.save();



        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: item,
        });
    }
    catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating item',
            error: error instanceof Error ? error.message : error,
        });
    }
}

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        const itemId = req.params.id;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }
        if (!itemId) {
            res.status(400).json({
                success: false,
                message: "Item ID is required"
            });
            return;
        }

        const item = await Items.findOne({
            where: { standardItemId: itemId },
        });

        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Item not found',
            });
            return;
        }

        await item.destroy();

        res.status(200).json({
            success: true,
            message: 'Item deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting item',
            error: error instanceof Error ? error.message : error,
        });
    }
}
