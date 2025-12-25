import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';

export interface UserAttributes {
    id: number;
    userId: string;
    email: string;
    name: string;
    password: string;
    role: 'super_admin' | 'admin' | 'user';
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public userId!: string;
    public email!: string;
    public name!: string;
    public password!: string;
    public role!: 'super_admin' | 'admin' | 'user';
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;

    // Instance method to validate password
    public async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}

export function initializeUserModel(sequelize: Sequelize): typeof User {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('super_admin', 'admin', 'user'),
                allowNull: false,
                defaultValue: 'user',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            paranoid: true,
            hooks: {
                beforeCreate: async (user: User) => {
                    if (user.password) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
                beforeUpdate: async (user: User) => {
                    if (user.changed('password')) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
            },
        }
    );

    return User;
}

export default User;
