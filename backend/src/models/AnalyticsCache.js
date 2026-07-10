import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const AnalyticsCache = sequelize.define('AnalyticsCache', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    scope: { type: DataTypes.STRING, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false },
    data: { type: DataTypes.JSON, defaultValue: {} },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

AnalyticsCache.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AnalyticsCache, { foreignKey: 'userId' });

export default AnalyticsCache;
