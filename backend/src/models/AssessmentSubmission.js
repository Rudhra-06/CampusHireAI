import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Assessment from './Assessment.js';

const AssessmentSubmission = sequelize.define('AssessmentSubmission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'expired'), defaultValue: 'in_progress' },
    startedAt: { type: DataTypes.DATE, allowNull: false },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
    timeTakenMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    attemptsUsed: { type: DataTypes.INTEGER, defaultValue: 1 },
    score: { type: DataTypes.FLOAT, defaultValue: 0 },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

AssessmentSubmission.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
AssessmentSubmission.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });
User.hasMany(AssessmentSubmission, { foreignKey: 'studentId' });
Assessment.hasMany(AssessmentSubmission, { foreignKey: 'assessmentId' });

export default AssessmentSubmission;
