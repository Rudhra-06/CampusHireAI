import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import AssessmentSubmission from './AssessmentSubmission.js';

const AssessmentResult = sequelize.define('AssessmentResult', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    overallScore: { type: DataTypes.FLOAT, defaultValue: 0 },
    programmingScore: { type: DataTypes.FLOAT, defaultValue: 0 },
    mcqScore: { type: DataTypes.FLOAT, defaultValue: 0 },
    timeTakenMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    passed: { type: DataTypes.BOOLEAN, defaultValue: false },
    feedback: { type: DataTypes.TEXT, defaultValue: '' },
    skillAnalysis: { type: DataTypes.JSON, defaultValue: [] },
    improvementSuggestions: { type: DataTypes.JSON, defaultValue: [] },
    recommendedTopics: { type: DataTypes.JSON, defaultValue: [] },
    learningResources: { type: DataTypes.JSON, defaultValue: [] },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

AssessmentResult.belongsTo(AssessmentSubmission, { foreignKey: 'submissionId', as: 'submission' });
AssessmentSubmission.hasOne(AssessmentResult, { foreignKey: 'submissionId' });

export default AssessmentResult;
