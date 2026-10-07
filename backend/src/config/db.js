import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const enableSSL = process.env.PG_SSL === 'true' || (isProduction && process.env.PG_SSL !== 'false');

const dialectOptions = enableSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED === 'true',
      },
    }
  : {};

const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  dialect: 'postgres',
  dialectOptions,
  logging: false,
});

export default sequelize;

