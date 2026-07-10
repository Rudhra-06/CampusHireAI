import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Job from './Job.js';

const CoverLetter = sequelize.define('CoverLetter', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  letterText:  { type: DataTypes.TEXT,    allowNull: false },
  tone:        { type: DataTypes.STRING,  defaultValue: 'professional' },
  length:      { type: DataTypes.STRING,  defaultValue: 'medium' },
  jobSnapshot: { type: DataTypes.JSONB,   defaultValue: {} }, // title + company at generation time
  jobId:       { type: DataTypes.INTEGER, allowNull: true },
}, { timestamps: true });

CoverLetter.belongsTo(User, { foreignKey: { name: 'studentId', allowNull: false }, as: 'student' });
User.hasMany(CoverLetter, { foreignKey: 'studentId' });

CoverLetter.belongsTo(Job, { foreignKey: 'jobId', as: 'job', constraints: false });

export default CoverLetter;
