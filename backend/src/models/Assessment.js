import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Job from './Job.js';

const Assessment = sequelize.define('Assessment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    instructions: { type: DataTypes.TEXT, defaultValue: '' },
    durationMinutes: { type: DataTypes.INTEGER, defaultValue: 60 },
    passingScore: { type: DataTypes.FLOAT, defaultValue: 50 },
    attemptsAllowed: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: { type: DataTypes.ENUM('draft', 'published', 'closed'), defaultValue: 'draft' },
    totalMarks: { type: DataTypes.FLOAT, defaultValue: 100 },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

Assessment.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });
Assessment.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
User.hasMany(Assessment, { foreignKey: 'recruiterId' });
Job.hasMany(Assessment, { foreignKey: 'jobId' });

export default Assessment;
