import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import PartyDetails from './partyDetails.model';
import DraftDCDetails from './draftDcDetails.model';

export interface DraftDCItemsAttributes {
    id: number;
    draftId: string;
    partyId: string;
    itemId?: string;
    itemName: string;
    itemDescription: string;
    uom: string;
    quantity: number;
    weightPerUnit: number;
    totalWeight: number;
    squareFeetPerUnit: number;
    totalSquareFeet: number;
    ratePerEach: number;
    remarks: string;
    projectName: string;
    projectIncharge: string;
    notes: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

interface DraftDCItemsCreationAttributes extends Optional<DraftDCItemsAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class DraftDCItems extends Model<DraftDCItemsAttributes, DraftDCItemsCreationAttributes> implements DraftDCItemsAttributes {
    public id!: number;
    public draftId!: string;
    public partyId!: string
    public itemId!: string;
    public itemName!: string
    public itemDescription!: string;
    public uom!: string;
    public quantity!: number;
    public weightPerUnit!: number;
    public totalWeight!: number;
    public squareFeetPerUnit!: number;
    public totalSquareFeet!: number;
    public ratePerEach!: number;
    public remarks!: string;
    public projectName!: string;
    public projectIncharge!: string;
    public notes!: string;
    public createdBy!: string;
    public updatedBy!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;
}

export function initializeDraftDCItemsModel(sequelize: Sequelize): typeof DraftDCItems {
    DraftDCItems.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            draftId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: false,
                references: {
                    model: DraftDCDetails,
                    key: 'draftId',
                },
            },
            partyId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                references: {
                    model: PartyDetails,
                    key: 'partyId',
                },
            },
            itemId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            itemName: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            itemDescription: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            uom: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            quantity: { 
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            weightPerUnit: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            totalWeight: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            squareFeetPerUnit: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            totalSquareFeet: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            ratePerEach: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            remarks: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            projectName: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            projectIncharge: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            updatedBy: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },

        },
        {
            sequelize,
            modelName: 'DraftDCItems',
            tableName: 'draft_dc_items',
            timestamps: true,
            paranoid: true,
            comment: 'Table for storing draft delivery challan items',
        }
    );

    return DraftDCItems;
}

export default DraftDCItems;
