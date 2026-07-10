import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Job from './Job.js';

const InterviewSession = sequelize.define('InterviewSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending'
  },
  overallScore:   { type: DataTypes.FLOAT, defaultValue: null },
  reportSummary:  { type: DataTypes.TEXT, defaultValue: null }
}, { timestamps: true });

InterviewSession.belongsTo(User, { foreignKey: { name: 'studentId',   allowNull: false }, as: 'student' });
InterviewSession.belongsTo(User, { foreignKey: { name: 'recruiterId', allowNull: false }, as: 'recruiter' });
InterviewSession.belongsTo(Job,  { foreignKey: { name: 'jobId',       allowNull: false }, as: 'job' });

User.hasMany(InterviewSession, { foreignKey: 'studentId' });
Job.hasMany(InterviewSession,  { foreignKey: 'jobId' });

export default InterviewSession;
