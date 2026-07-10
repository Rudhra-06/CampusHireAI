import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import AssessmentSubmission from './AssessmentSubmission.js';
import AssessmentQuestion from './AssessmentQuestion.js';

const CodingSubmission = sequelize.define('CodingSubmission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    language: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    score: { type: DataTypes.FLOAT, defaultValue: 0 },
    executionTime: { type: DataTypes.FLOAT, defaultValue: 0 },
    memoryUsage: { type: DataTypes.FLOAT, defaultValue: 0 },
    compilerOutput: { type: DataTypes.TEXT, defaultValue: '' },
    errorMessage: { type: DataTypes.TEXT, defaultValue: '' },
    testResults: { type: DataTypes.JSON, defaultValue: [] },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

CodingSubmission.belongsTo(AssessmentSubmission, { foreignKey: 'submissionId', as: 'submission' });
CodingSubmission.belongsTo(AssessmentQuestion, { foreignKey: 'questionId', as: 'question' });
AssessmentSubmission.hasMany(CodingSubmission, { foreignKey: 'submissionId' });
AssessmentQuestion.hasMany(CodingSubmission, { foreignKey: 'questionId' });

export default CodingSubmission;
