import { PartyDetails, User } from "../../core/models/index";
import { DraftDC } from "../../core/models/draftDcDetails.model";
import { Response, Request } from "express";
import { create } from "domain";



export const getAllDraftDcs = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }

        const draftDcs = await DraftDC.findAll({
            where: {
                userId: userId,
                status: 'DRAFT'
            }
        });

        res.status(200).json({
            success: true,
            message: "DraftDCs fetched successfully",
            userId: userId,
            count: draftDcs.length,
            data: draftDcs
        });
    }
    catch (error) {
        res.status(500).json({
            message: "While fetching DraftDCs, server encountered an error",
            error: error
        });
    }
};

export const getDraftDcById = async (req: Request, res: Response): Promise<void> => {

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
                message: "DraftID is required"
            });
            return;
        }

        const draftDc = await DraftDC.findOne({
            where: {
                draftId: id,
                userId: userId,
                status: 'DRAFT'
            }
        });

        // console.log("draftDc", draftDc);
        // console.log("id",id);
        // console.log("userId", userId);

        if (!draftDc) {
            res.status(404).json({
                success: false,
                message: "Draft DC not found"
            });
            return;
        }


        res.status(200).json({
            success: true,
            message: `Fetched draft DC with ID: ${id}`,
            data: draftDc
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error
        });
    }
};



export const createDraftDc = async (req: Request, res: Response): Promise<void> => {

    try {
        const userId = req.body.userId ?? req.auth?.userId;
        const userName = req.auth?.name ?? req.body.username;
        const draftDcData = req.body;


        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }


        const draftDcCreateData = {
            ...req.body,
            userId: userId,
            draftId: "",
            createdBy: userName,
            isAdmin: req.auth?.role?.includes('admin') ? true : false
        }

        try {
            const result = await DraftDC.create(draftDcCreateData);
            const postCreateDraftId = `DC-${result.id.toString().padStart(6, '0')}`;
            result.draftId = postCreateDraftId;
            await result.save();
            draftDcData.draftId = postCreateDraftId;


        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating draft DC",
                error
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: "Draft DC created",
            data:
            {
                draftId: draftDcData.draftId,
                ...draftDcData
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error
        });
    }
};

export const updateDraftDc = async (req: Request, res: Response): Promise<void> => {

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

        const draftDc = await DraftDC.findOne({
            where: {
                draftId: id,
                userId: userId,
                status: 'DRAFT'
            }
        });

        if (!draftDc) {
            res.status(404).json({
                success: false,
                message: "Requested Draft is not found"
            });
            return;
        }



        await draftDc.update(req.body);

        const updatedBy = await User.findOne({
            where: { userId: userId }
        });

        draftDc.updatedBy = updatedBy ? updatedBy.name : 'Unknown';
        // draftDc.userId = userId;
        await draftDc.save();

        res.status(200).json({
            success: true,
            message: `Draft DC with ID: ${id} updated`,

        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const deleteDraftDc = async (req: Request, res: Response): Promise<void> => {


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

        const draftDc = await DraftDC.findOne({
            where: {
                draftId: id,
                userId: userId,
                status: 'DRAFT'
            }
        });

        if (!draftDc) {
            res.status(404).json({
                success: false,
                message: "Requested Draft DC not found"
            });
            return;
        }

        await draftDc.destroy();

        res.status(200).json({
            success: true,
            message: `Draft DC with ID: ${id} deleted`
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};