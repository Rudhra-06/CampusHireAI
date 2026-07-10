import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import InterviewSession from './InterviewSession.js';

const InterviewQuestion = sequelize.define('InterviewQuestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  questionText: { type: DataTypes.TEXT, allowNull: false },
  questionType: {
    type: DataTypes.ENUM('technical', 'behavioral', 'situational', 'problem_solving'),
    defaultValue: 'technical'
  },
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });

InterviewQuestion.belongsTo(InterviewSession, { foreignKey: { name: 'sessionId', allowNull: false }, as: 'session' });
InterviewSession.hasMany(InterviewQuestion, { foreignKey: 'sessionId', as: 'questions' });

export default InterviewQuestion;
