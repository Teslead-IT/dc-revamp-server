import { Request, Response } from "express";
import { DraftDC } from "../../core/models/index";
import { Op } from "sequelize";



export const getDCData = async (req: Request, res: Response): Promise<void> => {

    try {
        const userId = req.body.userId ?? req.auth?.userId;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "User ID is required"
            });
            return;
        }

        let deletedDcs = 0;
        let approvedDcs = 0;
        let deletedDrafts = 0;
        let openedDcs = 0;
        let partialDcs = 0;
        let closedDcs =0;
        let draftDcs = 0;
             
        draftDcs = await DraftDC.count({
            where: {
                userId,
                status: 'DRAFT'
            }
        });

        // deletedDrafts = await DraftDC.count({
        //     where: {
        //         userId,
        //         status: 'DELETED',
        //         deletedAt: {
        //             [Op.ne]: null
        //         }
                
        //     },
        //     paranoid: false
        // });

        // deletedDcs = await DraftDC.count({
        //     where: {
        //         userId,
        //         status: 'DELETED',
        //         dcNumber: {
        //             [Op.ne]: null
        //         }
        //         deletedAt: {
        //             [Op.ne]: null
        //         }
        //     },
        //     paranoid: false
        // });





        res.status(200).json({
            success: true,
            message: "DraftDCs fetched successfully",
            count: draftDcs,
          
        });
    }
    catch (error) {
        res.status(500).json({
            message: "While fetching DraftDCs, server encountered an error",
            error: error
        });
    }
}