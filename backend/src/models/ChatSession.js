import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const ChatSession = sequelize.define('ChatSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, defaultValue: 'New Chat' },
    pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

ChatSession.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
User.hasMany(ChatSession, { foreignKey: 'studentId' });

export default ChatSession;
