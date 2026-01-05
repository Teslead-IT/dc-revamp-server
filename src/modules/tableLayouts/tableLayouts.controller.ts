import { Request, Response } from "express";
import { UserTableLayout } from "../../core/models/index";

export const TABLE_LAYOUT_VERSIONS: Record<string, number> = {
    draft_dc_items_table: 5,
    draft_dc_table: 2,
    items_table: 1,
    party_table: 1
};


export const getTableLayout = async (req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const { tableKey } = req.params;

        if (!userId || !tableKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing userId or tableKey',
            });
        }

        const record = await UserTableLayout.findOne({
            where: { userId, tableKey },
            attributes: ['layout', 'version'],
        });

        res.json({
            success: true,
            message: 'Table layout fetched successfully',
            data: record ?? null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch table layout',
            error: (error as Error).message,
        });
    }
};


export const saveTableLayout = async (req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const { tableKey } = req.params;
        const { layout } = req.body;

        // console.log(
        //     'layout columns expanded',
        //     layout.columns.map((c: any) => ({
        //         key: c.key,
        //         order: c.order,
        //         width: c.width,
        //         visible: c.visible,
        //         pinned: c.pinned
        //     }))
        // );


        if (!userId || !tableKey || !layout) {
            return res.status(400).json({
                success: false,
                message: 'Missing required data',
            });
        }

        const currentVersion = TABLE_LAYOUT_VERSIONS[tableKey];
        if (!currentVersion) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableKey',
            });
        }

        const existing = await UserTableLayout.findOne({
            where: { userId, tableKey },
        });

        if (existing) {
            existing.layout = layout;
            existing.version = currentVersion; // 🔥 overwrite, not increment
            await existing.save();
        } else {
            await UserTableLayout.create({
                userId,
                tableKey,
                layout,
                version: currentVersion,
            });
        }

        res.json({
            success: true,
            message: 'Table layout saved',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to save table layout',
        });
    }
};