import { Op, Transaction } from "sequelize";
import { Items } from "../../core/models/index";
import { normalizeSearch } from "../../modules/draftDcItems/draftDcItems.controller";
/**
 * Helper: Sync item names to ItemNames master table (bulk-safe)
 */

async function syncItemNamesToMaster(
    itemNames: string[],
    transaction?: Transaction
): Promise<void> {
    // Build unique normalized map
    const normalizedMap = new Map<string, string>();

    for (const name of itemNames) {
        const normalized = normalizeSearch(name);
        if (!normalizedMap.has(normalized)) {
            normalizedMap.set(normalized, name);
        }
    }

    if (normalizedMap.size === 0) return;

    // Fetch existing item names in ONE query
    const existingItems = await Items.findAll({
        where: {
            searchText: { [Op.in]: Array.from(normalizedMap.keys()) }
        },
        transaction,
    });

    const existingSearchSet = new Set(existingItems.map((i) => i.searchText));

    // Prepare missing item names
    const newItemNames = Array.from(normalizedMap.entries())
        .filter(([normalized]) => !existingSearchSet.has(normalized))
        .map(([_, itemName]) => ({ itemName }));

    // Bulk insert missing ones
    if (newItemNames.length > 0) {
        const createdItems = await Items.bulkCreate(
            newItemNames.map(item => ({ ...item, standardItemId: "", searchText: normalizeSearch(item.itemName) })),
            {
                individualHooks: true,
                transaction,
            }
        );

        // Update standardItemId based on created item ids
        await Promise.all(
            createdItems.map(item =>
                item.update(
                    { standardItemId: `STDIT-${item.id.toString().padStart(6, '0')}` },
                    { transaction }
                )
            )
        );
    }
}


async function addSingleItem(
    data: any,
    method: string,
    itemId?: string,
    transaction?: Transaction
): Promise<{ success: boolean; message: string; data: Items }> {
    const searchText = normalizeSearch(data.itemName);
    const itemName = data.itemName;

    try {

        const methodType = method.toLowerCase();
        if (methodType !== "add" && methodType !== "update") {
            throw new Error("Invalid method type. Use 'add' or 'update'.");
        }

        if (methodType === "update") {
            const updatedItem = await Items.update(
                { itemName, searchText },
                { where: itemId ? { standardItemId: itemId } : {}, transaction });
            return {
                success: true,
                message: 'Item updated successfully',
                data: updatedItem[0] as unknown as Items,
            }; // updated successfully
        }

        const newItem = await Items.create(
            { itemName, searchText, standardItemId: "" },
            { transaction }
        );

        newItem.standardItemId = `STDIT-${newItem.id.toString().padStart(6, '0')}`;
        await newItem.save();

        return {
            success: true,
            message: 'Item created successfully',
            data: newItem,
        }; // inserted successfully
    } catch (error: any) {
        // Sequelize duplicate key error
        if (error.name === 'SequelizeUniqueConstraintError') {
            return {
                success: false,
                message: 'Item already exists',
                data: null as unknown as Items,
            }; // duplicate
        }
        throw error; // real error, don’t swallow it
    }
}


export { syncItemNamesToMaster, addSingleItem, normalizeSearch };