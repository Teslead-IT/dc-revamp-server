import { DataTypes, Model, Optional, Sequelize } from 'sequelize';


export interface ItemsAttributes {
    id: number;
    standardItemId?: string;
    itemName: string;
    searchText?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}


interface ItemsCreationAttributes
    extends Optional<ItemsAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class Items
    extends Model<ItemsAttributes, ItemsCreationAttributes>
    implements ItemsAttributes {
    public id!: number;
    public standardItemId!: string;
    public itemName!: string;
    public searchText!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;
}

export function initializeItemsModel(sequelize: Sequelize): typeof Items {
    Items.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            standardItemId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: false
            },
            itemName: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            searchText: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Items',
            tableName: 'items',
            timestamps: true,
            paranoid: true,
            comment: 'Table for storing items details',
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

    return Items;
}

export default Items;
