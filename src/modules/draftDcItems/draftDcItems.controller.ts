import { Request, Response } from "express";
import { draftDCItemsCreateSchema, draftDCItemsUpdateSchema } from "../../shared/validations/index";
import { DraftDCItems } from "../../core/models/index";

export const getAllDraftDcItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }
        const draftDcItems = await DraftDCItems.findAll();

        res.status(200).json({
            success: true,
            message: "DraftDCItems fetched successfully",
            count: draftDcItems.length,
            data: draftDcItems
        });
    }
    catch (error) {
        res.status(500).json({
            message: "While fetching DraftDCItems, server encountered an error",
            error: error
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
  try {
    const userId = req.body.userId ?? req.auth?.userId;
    const userName = req.auth?.name ?? req.body.username;

    console.log("DCItems Body", req.body);

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    // ✅ Validate request
    const validation = draftDCItemsCreateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const { draftId, partyId, items } = validation.data;

    const createdItems = [];

    // ✅ Insert items one by one (safe + simple)
    for (const item of items) {
      const result = await DraftDCItems.create({
        ...item,
        draftId,
        partyId,
        createdBy: userName,
        updatedBy: userName,
        itemId: '',
      });

      // ✅ Generate itemId from Postgres ID
      result.itemId = `DCITEM${String(result.id).padStart(6, '0')}`;
      await result.save();

      createdItems.push(result);
    }

    res.status(201).json({
      success: true,
      message: "Draft DC items created successfully",
      data: createdItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "While creating DraftDCItem, server encountered an error",
      error,
    });
  }
};

 
export const updateDraftDcItems = async (  req: Request,  res: Response): Promise<void> => {
  try {
    const userId = req.body.userId ?? req.auth?.userId;
    const userName = req.auth?.name ?? req.body.username;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    // ✅ Validate body
    const validation = draftDCItemsUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const { items } = validation.data;
    if(!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "No items provided for update",
      });
      return;
    }
    const updatedItems = [];

    // ✅ Update each item independently
    for (const item of items) {
      const { itemId, ...updateFields } = item;

      const draftDcItem = await DraftDCItems.findOne({
        where: { itemId },
      });

      if (!draftDcItem) {
        res.status(404).json({
          success: false,
          message: `DraftDCItem with ID ${itemId} not found`,
        });
        return;
      }

      await draftDcItem.update({
        ...updateFields,
        updatedBy: userName,
      });

      updatedItems.push(draftDcItem);
    }

    res.status(200).json({
      success: true,
      message: "Draft DC items updated successfully",
      data: updatedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "While updating DraftDCItems, server encountered an error",
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