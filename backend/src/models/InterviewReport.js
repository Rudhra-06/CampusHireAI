import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import InterviewSession from './InterviewSession.js';

const InterviewReport = sequelize.define('InterviewReport', {
  id:                    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  overallScore:          { type: DataTypes.FLOAT,   allowNull: false },
  technicalScore:        { type: DataTypes.FLOAT,   allowNull: false },
  communicationScore:    { type: DataTypes.FLOAT,   allowNull: false },
  problemSolvingScore:   { type: DataTypes.FLOAT,   allowNull: false },
  behavioralScore:       { type: DataTypes.FLOAT,   allowNull: false },
  confidenceScore:       { type: DataTypes.FLOAT,   allowNull: false },
  strengths:             { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  weaknesses:            { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  missingSkills:         { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  suggestedTopics:       { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  suggestedCertifications: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  interviewSummary:      { type: DataTypes.TEXT,    allowNull: false },
  recruiterRecommendation: {
    type: DataTypes.ENUM('Strong Hire', 'Hire', 'Consider', 'Needs Improvement', 'Reject'),
    allowNull: false
  },
}, { timestamps: true });

InterviewReport.belongsTo(InterviewSession, { foreignKey: { name: 'sessionId', allowNull: false }, as: 'session' });
InterviewSession.hasOne(InterviewReport, { foreignKey: 'sessionId', as: 'report' });

export default InterviewReport;
