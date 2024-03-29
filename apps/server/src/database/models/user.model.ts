import { DataTypes, Model, Sequelize } from "sequelize";
import TeamModel from "./team.model";
import bcrypt from "bcrypt";

interface UserAttributes {
  id: string;
  gh_id?: string;
  gh_username?: string;
  username: string;
  name: string;
  surname: string;
  password: string;
  pfp?: string;
}

interface UserCreationAttributes extends UserAttributes {}

interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

const UserModel = (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance>(
    "user",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      gh_id: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true,
      },
      gh_username: {
        allowNull: true,
        type: DataTypes.STRING,
        unique: true,
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      surname: {
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      pfp: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  // Password Hashing
  User.beforeCreate(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });
  return User;
};
export default UserModel;
