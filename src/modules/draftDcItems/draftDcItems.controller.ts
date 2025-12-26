import { Request, Response } from "express";
import { draftDCItemsCreateSchema } from "../../shared/validations/index";
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

// export const createDraftDcItem = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userId = req.body.userId ?? req.auth?.userId;
//         const userName = req.auth?.name ?? req.body.username;
//         if (!userId) {
//             res.status(400).json({
//                 success: false,
//                 message: "User ID is required"
//             });
//             return;
//         }

//     const validation = draftDCItemsCreateSchema.safeParse(req.body);


//         const { items } = validation.data;

//         const createdItems = [];

//         for (const item of items) {
//             const result = await DraftDCItems.create({
//                 ...item,
//                 draftId,
//                 partyId,
//                 createdBy: userName,
//                 updatedBy: userName,
//                 userId,
//                 itemId: '' // placeholder
//             });

//             const itemId = `DCITEM${String(result.id).padStart(6, '0')}`;
//             result.itemId = itemId;
//             await result.save();

//             createdItems.push(result);
//         }





//         // const validation = draftDCItemsCreateSchema.safeParse(req.body);
//         // if (!validation.success) {
//         //     res.status(400).json({
//         //         success: false,
//         //         message: "Validation failed",
//         //         errors: validation.error.errors,
//         //     });
//         //     return;
//         // }
//         // const finalData = {
//         //     ...validation.data,
//         //     createdBy: userName,
//         //     userId: userId,
//         //     itemId: '',
//         //     updatedBy: userName,
//         // };

//         // const result = await DraftDCItems.create(finalData);

//         // const itemId = `DCITEM${result.id.toString().padStart(6, '0')}`;
//         // result.itemId = itemId;
//         // await result.save();
//         res.status(201).json({
//             success: true,
//             message: "DraftDCItem created successfully",
//             data: finalData
//         });
//     }
//     catch (error) {
//         res.status(500).json({
//             message: "While creating DraftDCItem, server encountered an error",
//             error: error
//         });
//     }
// };