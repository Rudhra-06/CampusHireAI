import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import AssessmentSubmission from './AssessmentSubmission.js';
import AssessmentQuestion from './AssessmentQuestion.js';

const MCQSubmission = sequelize.define('MCQSubmission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    selectedAnswers: { type: DataTypes.JSON, defaultValue: [] },
    isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false },
    score: { type: DataTypes.FLOAT, defaultValue: 0 },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

MCQSubmission.belongsTo(AssessmentSubmission, { foreignKey: 'submissionId', as: 'submission' });
MCQSubmission.belongsTo(AssessmentQuestion, { foreignKey: 'questionId', as: 'question' });
AssessmentSubmission.hasMany(MCQSubmission, { foreignKey: 'submissionId' });
AssessmentQuestion.hasMany(MCQSubmission, { foreignKey: 'questionId' });

export default MCQSubmission;
