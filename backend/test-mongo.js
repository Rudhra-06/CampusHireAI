/**
 * LEGACY / DEPRECATED: CampusHireAI uses PostgreSQL via Sequelize.
 * This file is retained for reference only and is not used in production.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
