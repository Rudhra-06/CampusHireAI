import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('student', 'recruiter', 'admin'), allowNull: false },
  branch: DataTypes.STRING,
  cgpa: DataTypes.FLOAT,
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  resumeURL: DataTypes.STRING,
  companyName: DataTypes.STRING,
  approved: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.prototype.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

export default User;
