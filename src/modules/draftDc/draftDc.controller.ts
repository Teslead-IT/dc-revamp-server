import { DraftDCItems, PartyDetails, User , ItemNames} from "../../core/models/index";
import { DraftDC } from "../../core/models/draftDcDetails.model";
import { Response, Request } from "express";
import { create } from "domain";




export const getDraftDcDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.userId ?? req.auth?.userId;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 25, 100);
        const offset = (page - 1) * limit;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }

        // const draftDcDetails = await DraftDC.findAll({
        //     where: {
        //         userId: userId,
        //         status: 'DRAFT'
        //     },
        //     include: [
        //         {
        //             model: PartyDetails,
        //             as: 'partyDetails',
        //         },
        //         {
        //             model: DraftDCItems,
        //             as: 'draftDcItems',
        //         }
        //     ]

        // });

        const { rows, count } = await DraftDC.findAndCountAll({
            where: {
                userId,
                status: 'DRAFT',
            },
            include: [
                {
                    model: PartyDetails,
                    as: 'partyDetails',
                },
                {
                    model: DraftDCItems,
                    as: 'draftDcItems',
                },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']], // important for pagination stability
        });
        res.status(200).json({
            success: true,
            message: "DraftDCDetails fetched successfully",
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
            data: rows,
        });
        // res.status(200).json({
        //     success: true,
        //     message: "DraftDCDetails fetched successfully",
        //     count: draftDcDetails.length,
        //     data: draftDcDetails
        // });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error
        });
    }
};

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
            },
            include: [
                {
                    model: PartyDetails,
                    as: 'partyDetails',
                },
                {
                    model: DraftDCItems,
                    as: 'draftDcItems',
                },
            ],
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

        // console.log("DC Body", req.body);

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }

        const supplierData =  await PartyDetails.findOne({
            where: {
                partyId: draftDcData.partyId
            }
        });

        if (!supplierData) {
            res.status(404).json({
                success: false,
                message: "Supplier not found to take snapshot"
            });
            return;
        }


        const draftDcCreateData = {
            ...req.body,
            supplierSnapshot: {
                "partyId": supplierData.partyId,
                "partyName": supplierData.partyName,
                "addressLine1": supplierData.addressLine1,
                "addressLine2": supplierData.addressLine2,
                "state": supplierData.state,
                "city": supplierData.city,
                "pinCode": supplierData.pinCode,
                "stateCode": supplierData.stateCode,
                "phone": supplierData.phone,
                "email": supplierData.email,
                "gstinNumber": supplierData.gstinNumber
            },
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
        console.log("Error while creating Draft DC", error instanceof Error ? error.message : "server error");
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


        const supplierData = await PartyDetails.findOne({
            where: {
                partyId: draftDc.partyId
            }
        });

        if (!supplierData) {
            res.status(404).json({
                success: false,
                message: "Supplier not found to take snapshot"
            });
            return;
        }

        const supplierSnapshot = {
            partyId: supplierData.partyId,
            partyName: supplierData.partyName,
            addressLine1: supplierData.addressLine1,
            addressLine2: supplierData.addressLine2,
            state: supplierData.state,
            city: supplierData.city,
            pinCode: supplierData.pinCode,
            stateCode: supplierData.stateCode,
            phone: supplierData.phone,
            email: supplierData.email,
            gstinNumber: supplierData.gstinNumber
        };

        req.body.supplierSnapshot = supplierSnapshot;


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

        const draftDcItems = await DraftDCItems.findAll({
            where: {
                draftId: id
            }
        });
        for (const item of draftDcItems) {
            await item.destroy();
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