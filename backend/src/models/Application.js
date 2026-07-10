import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Job from './Job.js';

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aiScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  matchedSkills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  missingSkills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  status: {
    type: DataTypes.ENUM('applied', 'shortlisted', 'rejected', 'interview', 'selected'),
    defaultValue: 'applied'
  }
}, { timestamps: true });

Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
User.hasMany(Application, { foreignKey: 'studentId' });
Job.hasMany(Application, { foreignKey: 'jobId' });

export default Application;
