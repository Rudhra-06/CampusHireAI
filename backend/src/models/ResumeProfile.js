import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const ResumeProfile = sequelize.define('ResumeProfile', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  personalInfo:{ type: DataTypes.JSONB, defaultValue: {} },  // name,email,phone,address,linkedin,github,portfolio
  summary:     { type: DataTypes.TEXT,   defaultValue: '' },
  education:   { type: DataTypes.JSONB,  defaultValue: [] }, // [{college,degree,cgpa,year}]
  skills:      { type: DataTypes.JSONB,  defaultValue: [] }, // string[]
  projects:    { type: DataTypes.JSONB,  defaultValue: [] }, // [{name,description,tech,github}]
  experience:  { type: DataTypes.JSONB,  defaultValue: [] }, // [{company,role,duration,description}]
  internships: { type: DataTypes.JSONB,  defaultValue: [] }, // [{company,role,duration,description}]
  certifications:{ type: DataTypes.JSONB,defaultValue: [] }, // [{name,issuer,year}]
  achievements:{ type: DataTypes.JSONB,  defaultValue: [] }, // [{title,description}]
  languages:   { type: DataTypes.JSONB,  defaultValue: [] }, // [{name,proficiency}]
}, { timestamps: true });

ResumeProfile.belongsTo(User, { foreignKey: { name: 'studentId', allowNull: false }, as: 'student' });
User.hasOne(ResumeProfile, { foreignKey: 'studentId' });

export default ResumeProfile;
