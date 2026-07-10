import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Assessment from './Assessment.js';

const AssessmentQuestion = sequelize.define('AssessmentQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    questionType: { type: DataTypes.ENUM('mcq', 'programming', 'short_answer'), allowNull: false },
    prompt: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, defaultValue: [] },
    correctAnswers: { type: DataTypes.JSON, defaultValue: [] },
    difficulty: { type: DataTypes.STRING, defaultValue: 'medium' },
    points: { type: DataTypes.FLOAT, defaultValue: 10 },
    orderIndex: { type: DataTypes.INTEGER, defaultValue: 1 },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
    sampleInput: { type: DataTypes.TEXT, defaultValue: '' },
    sampleOutput: { type: DataTypes.TEXT, defaultValue: '' },
    inputFormat: { type: DataTypes.TEXT, defaultValue: '' },
    outputFormat: { type: DataTypes.TEXT, defaultValue: '' },
    constraints: { type: DataTypes.TEXT, defaultValue: '' },
    exampleTests: { type: DataTypes.JSON, defaultValue: [] },
    hiddenTests: { type: DataTypes.JSON, defaultValue: [] },
    expectedLanguage: { type: DataTypes.STRING, defaultValue: 'python' },
}, { timestamps: true });

AssessmentQuestion.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });
Assessment.hasMany(AssessmentQuestion, { foreignKey: 'assessmentId' });

export default AssessmentQuestion;
