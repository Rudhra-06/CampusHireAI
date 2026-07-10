import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import InterviewSession from './InterviewSession.js';
import InterviewQuestion from './InterviewQuestion.js';

const InterviewAnswer = sequelize.define('InterviewAnswer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  answerText:  { type: DataTypes.TEXT, defaultValue: null },
  aiScore:     { type: DataTypes.FLOAT, defaultValue: null },
  aiFeedback:  { type: DataTypes.TEXT, defaultValue: null }
}, { timestamps: true });

InterviewAnswer.belongsTo(InterviewSession, { foreignKey: { name: 'sessionId',  allowNull: false }, as: 'session' });
InterviewAnswer.belongsTo(InterviewQuestion,{ foreignKey: { name: 'questionId', allowNull: false }, as: 'question' });

InterviewSession.hasMany(InterviewAnswer,  { foreignKey: 'sessionId',  as: 'answers' });
InterviewQuestion.hasOne(InterviewAnswer,  { foreignKey: 'questionId', as: 'answer' });

export default InterviewAnswer;
