import { DataTypes, Model, Optional, Sequelize } from 'sequelize';


export interface ItemNamesAttributes {
    id: number;
    itemName: string;
    searchText?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}


interface ItemNamesCreationAttributes
    extends Optional<ItemNamesAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class ItemNames
    extends Model<ItemNamesAttributes, ItemNamesCreationAttributes>
    implements ItemNamesAttributes {
    public id!: number;
    public itemName!: string;
    public searchText!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;
}

export function initializeItemNamesModel(sequelize: Sequelize): typeof ItemNames {
    ItemNames.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            itemName: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            searchText: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'ItemNames',
            tableName: 'item_names',
            timestamps: true,
            paranoid: true,
            comment: 'Table for storing item names',
            hooks: {
                beforeSave: (item) => {
                    // 🔥 THIS is where searchText is formatted & stored
                    item.searchText = item.itemName
                        .toLowerCase()
                        .replace(/[\s\-_]/g, '');
                },
            },
        }
    );

    return ItemNames;
}

export default ItemNames;
