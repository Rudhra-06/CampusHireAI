import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const ProjectRecommendation = sequelize.define('ProjectRecommendation', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  recommendations: { type: DataTypes.JSONB, defaultValue: [] },
  preferences:     { type: DataTypes.JSONB, defaultValue: {} }, // careerGoal, domain, difficulty, techStack
  bookmarks:       { type: DataTypes.JSONB, defaultValue: [] }, // array of project title strings
}, { timestamps: true });

ProjectRecommendation.belongsTo(User, { foreignKey: { name: 'studentId', allowNull: false }, as: 'student' });
User.hasOne(ProjectRecommendation, { foreignKey: 'studentId' });

export default ProjectRecommendation;
