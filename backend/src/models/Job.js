import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  requiredSkills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  minCGPA: { type: DataTypes.FLOAT, allowNull: false },
  eligibleBranches: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  companyName: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'closed'), defaultValue: 'active' }
}, { timestamps: true });

Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });
User.hasMany(Job, { foreignKey: 'recruiterId' });

export default Job;
