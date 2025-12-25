import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface DraftDCAttributes {
    id: number;
    draftData: object;
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

interface DraftDCCreationAttributes extends Optional<DraftDCAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class DraftDC extends Model<DraftDCAttributes, DraftDCCreationAttributes> implements DraftDCAttributes {
    public id!: number;
    public draftData!: object;
    public createdBy!: string;
    public updatedBy!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;
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
            draftData: {
                type: DataTypes.JSONB,
                allowNull: false,
            },
            createdBy: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            updatedBy: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'DraftDC',
            tableName: 'draft_dc',
            timestamps: true,
            paranoid: true,
            comment: 'Table for storing draft delivery challans',
        }
    );

    return DraftDC;
}

export default DraftDC;
