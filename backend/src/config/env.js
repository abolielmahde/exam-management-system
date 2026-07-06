import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5001),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  databaseUrl: process.env.DATABASE_URL || 'postgres://exam_user:exam_password@localhost:5432/exam_management',
  databaseSsl: String(process.env.DATABASE_SSL || 'false').toLowerCase() === 'true'
};
