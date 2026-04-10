import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Trivial'];
const VALID_PROGRESS = [
  'Not Started',
  'In Development',
  'In Code Review',
  'In QA',
  'Ready for Release',
  'Live',
];

export function createBugsRouter(pool: Pool) {
  const router = Router();

  // POST /api/bugs — create a new bug
  router.post('/', async (req: Request, res: Response) => {
    const { title, severity, progress, reporter_name, estimated_fix_hours, date_reported } = req.body;

    if (!title || !severity || !progress || !reporter_name || estimated_fix_hours == null || !date_reported) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity value' });
    }
    if (!VALID_PROGRESS.includes(progress)) {
      return res.status(400).json({ error: 'Invalid progress value' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO bugs (title, severity, progress, reporter_name, estimated_fix_hours, date_reported)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, severity, progress, reporter_name, estimated_fix_hours, date_reported]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /api/bugs — list bugs with optional filters
  router.get('/', async (req: Request, res: Response) => {
    const { progress, severity, date_range, reporter_name } = req.query;

    const conditions: string[] = [];
    const params: string[] = [];
    let paramIdx = 1;

    if (progress) {
      const progressArr = Array.isArray(progress) ? progress : [progress];
      const placeholders = progressArr.map(() => `$${paramIdx++}`).join(', ');
      conditions.push(`progress IN (${placeholders})`);
      params.push(...(progressArr as string[]));
    }

    if (severity) {
      const severityArr = Array.isArray(severity) ? severity : [severity];
      const placeholders = severityArr.map(() => `$${paramIdx++}`).join(', ');
      conditions.push(`severity IN (${placeholders})`);
      params.push(...(severityArr as string[]));
    }

    if (date_range && date_range !== 'all_time') {
      let interval = '';
      if (date_range === 'this_week') interval = '7 days';
      else if (date_range === 'last_2_weeks') interval = '14 days';
      else if (date_range === 'this_month') interval = '30 days';
      if (interval) {
        conditions.push(`date_reported >= NOW() - INTERVAL '${interval}'`);
      }
    }

    if (reporter_name && reporter_name !== '') {
      conditions.push(`reporter_name = $${paramIdx++}`);
      params.push(reporter_name as string);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const result = await pool.query(
        `SELECT * FROM bugs ${where} ORDER BY date_reported DESC, id DESC`,
        params
      );
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // GET /api/bugs/reporters — distinct reporter names
  router.get('/reporters', async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT DISTINCT reporter_name FROM bugs ORDER BY reporter_name ASC`
      );
      return res.json(result.rows.map((r: { reporter_name: string }) => r.reporter_name));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
}
