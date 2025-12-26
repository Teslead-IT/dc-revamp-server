import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface PartyDetailsAttributes {
    id: number;
    partyId: string;
    partyName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    stateCode: number;
    pinCode: number;
    gstinNumber: string;
    email: string;
    phone: string;
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

interface PartyDetailsCreationAttributes
    extends Optional<PartyDetailsAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class PartyDetails
    extends Model<PartyDetailsAttributes, PartyDetailsCreationAttributes>
    implements PartyDetailsAttributes {
    public id!: number;
    public partyId!: string;
    public partyName!: string;
    public addressLine1!: string;
    public addressLine2!: string;
    public city!: string;
    public state!: string;
    public stateCode!: number;
    public pinCode!: number;
    public gstinNumber!: string;
    public email!: string;
    public phone!: string;
    public createdBy!: string;
    public updatedBy!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;
}

export function initializePartyDetailsModel(sequelize: Sequelize): typeof PartyDetails {
    PartyDetails.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            partyId: {
                type: DataTypes.STRING(100),
                unique: true,
                allowNull: false,
            },
            partyName: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            addressLine1: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            addressLine2: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            state: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            stateCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            pinCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            gstinNumber: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(50),
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
            modelName: 'PartyDetails',
            tableName: 'party_details',
            timestamps: true,
            paranoid: true,
            comment: 'Table for storing party details',
        }
    );

    return PartyDetails;
}

export default PartyDetails;
