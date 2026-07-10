import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ChatSession from './ChatSession.js';

const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
}, { timestamps: true });

ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId' });

export default ChatMessage;
