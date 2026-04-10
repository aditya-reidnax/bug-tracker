import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { createBugsRouter } from './routes/bugs';
import { createAnalyticsRouter } from './routes/analytics';

export function createApp(pool: Pool) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/bugs', createBugsRouter(pool));
  app.use('/api/analytics', createAnalyticsRouter(pool));
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  return app;
}
