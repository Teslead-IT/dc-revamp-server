import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserTableLayoutAttributes {
  id: number;
  userId: string;
  tableKey: string;
  layout: any;              // JSON layout
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
    deletedAt?: Date;
}

interface UserTableLayoutCreationAttributes
  extends Optional<UserTableLayoutAttributes, 'id' | 'version' | 'createdAt' | 'updatedAt'> {}

export class UserTableLayout
  extends Model<UserTableLayoutAttributes, UserTableLayoutCreationAttributes>
  implements UserTableLayoutAttributes {

  public id!: number;
  public userId!: string;
  public tableKey!: string;
  public layout!: any;
  public version!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

export function initializeUserTableLayoutModel(
  sequelize: Sequelize
): typeof UserTableLayout {
  UserTableLayout.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tableKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      layout: {
        type: DataTypes.JSONB,   // 🔥 IMPORTANT (Postgres)
        allowNull: false,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      tableName: 'user_table_layouts',
      timestamps: true,
        paranoid: true,

      indexes: [
        {
          unique: true,
          fields: ['userId', 'tableKey'], // 🔥 one layout per user per table
        },
      ],
      comment: 'Stores per-user table column layout preferences',
    }
  );

  return UserTableLayout;
}

export default UserTableLayout;
