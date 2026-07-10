import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const ResumeAnalysis = sequelize.define('ResumeAnalysis', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  resumeScore:  { type: DataTypes.FLOAT,   defaultValue: 0 },
  analysisData: { type: DataTypes.JSONB,   defaultValue: {} },
  source:       { type: DataTypes.STRING,  defaultValue: 'auto' }, // 'pdf' | 'builder' | 'auto'
  jobId:        { type: DataTypes.INTEGER, defaultValue: null },   // optional job context
}, { timestamps: true });

ResumeAnalysis.belongsTo(User, { foreignKey: { name: 'studentId', allowNull: false }, as: 'student' });
User.hasOne(ResumeAnalysis, { foreignKey: 'studentId' });

export default ResumeAnalysis;
