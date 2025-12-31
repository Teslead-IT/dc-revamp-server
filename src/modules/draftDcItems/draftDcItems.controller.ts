import { Request, Response } from "express";
import { draftDCItemsCreateSchema, draftDCItemsUpdateSchema } from "../../shared/validations/index";
import { DraftDCItems, Items } from "../../core/models/index";
import { Op, Transaction } from "sequelize";
import { getSequelize } from "../../shared/db/postgres";
import { syncItemNamesToMaster } from "../../shared/helperFunctions/itemSearchText";





export const normalizeSearch = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]+/g, '');
};

export const getAllDraftDcItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchTerm = req.query.searchTerm as string | undefined;

    // Pagination (for autocomplete / lists)
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    // 🔍 Search ONLY on item name (normalized)
    if (searchTerm && searchTerm.trim().length >= 2) {
      const normalized = normalizeSearch(searchTerm);

      whereClause.searchText = {
        [Op.like]: `%${normalized}%`,
      };
    }

    const { rows, count } = await Items.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'itemName'], // 🔥 ONLY what you need
      limit,
      offset,
      order: [['itemName', 'ASC']],
    });

    res.status(200).json({
      success: true,
      message: 'Item names fetched successfully',
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching item names:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item names',
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getDraftDcItemById = async (req: Request, res: Response): Promise<void> => {
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
        message: "DraftDCItem ID is required"
      });
      return;
    }
    const draftDcItem = await DraftDCItems.findOne({
      where: { itemId: id }
    });
    if (!draftDcItem) {
      res.status(404).json({
        success: false,
        message: "DraftDCItem not found"
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "DraftDCItem fetched successfully",
      data: draftDcItem
    });
  }
  catch (error) {
    res.status(500).json({
      message: "While fetching DraftDCItem, server encountered an error",
      error: error
    });
  }
};




export const createDraftDcItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const transaction = await getSequelize()?.transaction();

  try {
    const userId = req.body.userId ?? req.auth?.userId;
    const userName = req.auth?.name ?? req.body.username;

    if (!userId) {
      await transaction?.rollback();
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const validation = draftDCItemsCreateSchema.safeParse(req.body);
    if (!validation.success) {
      await transaction?.rollback();
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors,
      });
      return;
    }

    const { draftId, partyId, items } = validation.data;

    // Create draft DC items
    const createdItems: DraftDCItems[] = [];
    for (const item of items) {
      const dcItem = await DraftDCItems.create(
        {
          ...item,
          draftId,
          partyId,
          createdBy: userName,
          updatedBy: userName,
          itemId: '',
        },
        { transaction }
      );

      dcItem.itemId = `DCITEM${String(dcItem.id).padStart(6, '0')}`;
      await dcItem.save({ transaction });
      createdItems.push(dcItem);
    }

    // Sync item names to master table
    await syncItemNamesToMaster(
      items.map((i) => i.itemName),
      transaction
    );

    await transaction?.commit();

    res.status(201).json({
      success: true,
      message: 'Draft DC items created successfully',
      count: createdItems.length,
      data: createdItems,
    });
  } catch (error) {
    await transaction?.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'While creating DraftDCItem, server encountered an error',
      error,
    });
  }
};



export const updateDraftDcItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const transaction = await getSequelize()?.transaction();

  try {
    const userId = req.body.userId ?? req.auth?.userId;
    const userName = req.auth?.name ?? req.body.username;

    if (!userId) {
      await transaction?.rollback();
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const validation = draftDCItemsUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      await transaction?.rollback();
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.errors,
      });
      return;
    }

    const { items } = validation.data;
    if (!items || items.length === 0) {
      await transaction?.rollback();
      res.status(400).json({
        success: false,
        message: 'No items provided for update',
      });
      return;
    }

    // Update each item
    const updatedItems: DraftDCItems[] = [];
    const updatedItemNames: string[] = [];

    for (const item of items) {
      const { itemId, ...updateFields } = item;

      const draftDcItem = await DraftDCItems.findOne({
        where: { itemId },
        transaction,
      });

      if (!draftDcItem) {
        await transaction?.rollback();
        res.status(404).json({
          success: false,
          message: `DraftDCItem with ID ${itemId} not found`,
        });
        return;
      }

      await draftDcItem.update(
        { ...updateFields, updatedBy: userName },
        { transaction }
      );

      updatedItems.push(draftDcItem);

      // Track updated item names for master sync
      if (updateFields.itemName) {
        updatedItemNames.push(updateFields.itemName);
      }
    }

    // Sync item names to master table
    if (updatedItemNames.length > 0) {
      await syncItemNamesToMaster(updatedItemNames, transaction);
    }

    await transaction?.commit();

    res.status(200).json({
      success: true,
      message: 'Draft DC items updated successfully',
      count: updatedItems.length,
      data: updatedItems,
    });
  } catch (error) {
    await transaction?.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'While updating DraftDCItems, server encountered an error',
      error,
    });
  }
};

export const deleteDraftDcItem = async (req: Request, res: Response): Promise<void> => {
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
        message: "DraftDCItem ID is required"
      });
      return;
    }
    const draftDcItem = await DraftDCItems.findOne({
      where: { itemId: id }
    });
    if (!draftDcItem) {
      res.status(404).json({
        success: false,
        message: "DraftDCItem not found"
      });
      return;
    }
    await draftDcItem.destroy();

    res.status(200).json({
      success: true,
      message: "DraftDCItem deleted successfully",
      data: draftDcItem
    });
  }
  catch (error) {
    res.status(500).json({
      message: "While deleting DraftDCItem, server encountered an error",
      error: error
    });
  }
};