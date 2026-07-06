import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { initDatabase } from './db/initDatabase.js';
import { pool } from './db/pool.js';
import { authRoutes } from './routes/authRoutes.js';
import { examRoutes } from './routes/examRoutes.js';
import { submissionRoutes } from './routes/submissionRoutes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'exam-management-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, async () => {
  try {
    await initDatabase();
    console.log(`Backend API is running on http://localhost:${env.port}`);
  } catch (error) {
    console.error('Failed to initialize database', error);
    process.exit(1);
  }
});

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
