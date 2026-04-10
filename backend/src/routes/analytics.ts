import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const PROGRESS_STAGES = [
  'Not Started',
  'In Development',
  'In Code Review',
  'In QA',
  'Ready for Release',
  'Live',
];

export function createAnalyticsRouter(pool: Pool) {
  const router = Router();

  // GET /api/analytics/progress-distribution
  router.get('/progress-distribution', async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT progress, COUNT(*) AS count FROM bugs GROUP BY progress`
      );
      const data = PROGRESS_STAGES.map((stage) => {
        const row = result.rows.find((r: { progress: string }) => r.progress === stage);
        return { stage, count: row ? parseInt(row.count, 10) : 0 };
      });
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /api/analytics/weekly-severity
  router.get('/weekly-severity', async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT
           TO_CHAR(DATE_TRUNC('week', date_reported), 'YYYY-MM-DD') AS week,
           severity,
           COUNT(*) AS count
         FROM bugs
         GROUP BY week, severity
         ORDER BY week ASC`
      );

      const weekMap: Record<string, Record<string, number>> = {};
      for (const row of result.rows) {
        if (!weekMap[row.week]) weekMap[row.week] = { week: row.week };
        weekMap[row.week][row.severity] = parseInt(row.count, 10);
      }

      const data = Object.values(weekMap).map((entry) => ({
        week: entry['week'],
        Critical: entry['Critical'] ?? 0,
        High: entry['High'] ?? 0,
        Medium: entry['Medium'] ?? 0,
        Low: entry['Low'] ?? 0,
        Trivial: entry['Trivial'] ?? 0,
      }));

      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /api/analytics/avg-dev-to-live
  router.get('/avg-dev-to-live', async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT AVG(estimated_fix_hours) AS avg_hours, COUNT(*) AS live_count
         FROM bugs WHERE progress = 'Live'`
      );
      const row = result.rows[0];
      return res.json({
        avg_hours: row.avg_hours ? parseFloat(parseFloat(row.avg_hours).toFixed(2)) : null,
        live_count: parseInt(row.live_count, 10),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /api/analytics/funnel
  router.get('/funnel', async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT progress, COUNT(*) AS count FROM bugs GROUP BY progress`
      );
      const data = PROGRESS_STAGES.map((stage, idx) => {
        const row = result.rows.find((r: { progress: string }) => r.progress === stage);
        return { stage, count: row ? parseInt(row.count, 10) : 0, order: idx };
      });
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}
