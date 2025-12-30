import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import PartyDetails from './partyDetails.model';

export interface DraftDCAttributes {
    id: number;
    draftId: string;
    partyId: string;
    vehicleNo: string;
    process: string;
    totalDispatchedQuantity: number;
    totalRate: number;
    status: "DRAFT" | "OPENED" | "CLOSED" | "PARTIAL" | "DELETED";
    showWeight: boolean;
    showSquareFeet: boolean;
    notes: string;
    createdBy: string;
    userId: string;
    isAdmin: boolean;
    updatedBy: string;
    dcType:  "SPM" | "VALVE" | "QC" ;
    dcDate: Date;
    supplierSnapshot: any;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

interface DraftDCCreationAttributes extends Optional<DraftDCAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class DraftDC extends Model<DraftDCAttributes, DraftDCCreationAttributes> implements DraftDCAttributes {
    public id!: number;
    public draftId!: string;
    public partyId!: string
    public vehicleNo!: string;
    public process!: string;
    public totalDispatchedQuantity!: number;
    public totalRate!: number;
    public status!: "DRAFT" | "OPENED" | "CLOSED" | "PARTIAL" | "DELETED";
    public showWeight!: boolean;
    public showSquareFeet!: boolean;
    public notes!: string;
    public createdBy!: string;
    public userId!: string;
    public isAdmin!: boolean;
    public updatedBy!: string;
    public dcType!: "SPM" | "VALVE" | "QC" ;
    public dcDate!: Date;
    public supplierSnapshot!: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;
}

export function initializeDraftDCModel(sequelize: Sequelize): typeof DraftDC {
    DraftDC.init(
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
                unique: true,
            },
            partyId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                references: {
                    model: PartyDetails,
                    key: 'partyId',
                },
            },
            vehicleNo: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            process: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            totalDispatchedQuantity: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            totalRate: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('DRAFT', 'OPENED', 'CLOSED', 'PARTIAL', 'DELETED'),
                allowNull: false,
                defaultValue: 'DRAFT',
            },
            showWeight: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            showSquareFeet: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            userId: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            updatedBy: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            dcType: {
                type: DataTypes.ENUM('SPM', 'VALVE', 'QC'),
                allowNull: false,   
            },
            dcDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            supplierSnapshot: {
                type: DataTypes.JSON,
                allowNull: true
            },

        },
        {
            sequelize,
            modelName: 'DraftDC',
            tableName: 'draft_dc',
            timestamps: true,
            paranoid: true,
            comment: 'Table for storing draft dc details',
        }
    );

    return DraftDC;
}

export default DraftDC;
