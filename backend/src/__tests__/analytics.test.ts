import request from 'supertest';
import { createApp } from '../app';
import testPool from './testDb';

const app = createApp(testPool);

beforeEach(async () => {
  await testPool.query('TRUNCATE TABLE bugs RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await testPool.end();
});

async function insertBug(overrides: Record<string, unknown> = {}) {
  const defaults = {
    title: 'Test bug',
    severity: 'Medium',
    progress: 'Not Started',
    reporter_name: 'Tester',
    estimated_fix_hours: 2,
    date_reported: '2026-04-10',
  };
  const b = { ...defaults, ...overrides };
  await testPool.query(
    `INSERT INTO bugs (title, severity, progress, reporter_name, estimated_fix_hours, date_reported)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [b.title, b.severity, b.progress, b.reporter_name, b.estimated_fix_hours, b.date_reported]
  );
}

// ─── GET /api/analytics/progress-distribution ────────────────────────────────

describe('GET /api/analytics/progress-distribution', () => {
  it('returns all 6 stages with zero counts when no bugs exist', async () => {
    const res = await request(app).get('/api/analytics/progress-distribution');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    res.body.forEach((item: { count: number }) => expect(item.count).toBe(0));
  });

  it('returns correct counts per progress stage', async () => {
    await insertBug({ progress: 'Not Started' });
    await insertBug({ progress: 'Not Started' });
    await insertBug({ progress: 'In Development' });
    await insertBug({ progress: 'Live' });

    const res = await request(app).get('/api/analytics/progress-distribution');
    expect(res.status).toBe(200);

    const byStage = Object.fromEntries(
      res.body.map((item: { stage: string; count: number }) => [item.stage, item.count])
    );
    expect(byStage['Not Started']).toBe(2);
    expect(byStage['In Development']).toBe(1);
    expect(byStage['Live']).toBe(1);
    expect(byStage['In Code Review']).toBe(0);
  });

  it('returns stages in the correct pipeline order', async () => {
    const res = await request(app).get('/api/analytics/progress-distribution');
    const stages = res.body.map((item: { stage: string }) => item.stage);
    expect(stages).toEqual([
      'Not Started',
      'In Development',
      'In Code Review',
      'In QA',
      'Ready for Release',
      'Live',
    ]);
  });
});

// ─── GET /api/analytics/weekly-severity ──────────────────────────────────────

describe('GET /api/analytics/weekly-severity', () => {
  it('returns empty array when no bugs exist', async () => {
    const res = await request(app).get('/api/analytics/weekly-severity');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('groups bugs by ISO week with correct severity counts', async () => {
    // 2026-04-06 is Monday of week 2026-04-06
    await insertBug({ severity: 'Critical', date_reported: '2026-04-06' });
    await insertBug({ severity: 'Critical', date_reported: '2026-04-07' });
    await insertBug({ severity: 'High',     date_reported: '2026-04-06' });
    // 2026-03-30 is in a different week
    await insertBug({ severity: 'Medium',   date_reported: '2026-03-30' });

    const res = await request(app).get('/api/analytics/weekly-severity');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const aprilWeek = res.body.find((w: { week: string }) => w.week === '2026-04-06');
    expect(aprilWeek).toBeDefined();
    expect(aprilWeek.Critical).toBe(2);
    expect(aprilWeek.High).toBe(1);
    expect(aprilWeek.Medium).toBe(0);
  });

  it('every entry has all 5 severity keys', async () => {
    await insertBug({ severity: 'Low', date_reported: '2026-04-10' });

    const res = await request(app).get('/api/analytics/weekly-severity');
    const entry = res.body[0];
    expect(entry).toHaveProperty('Critical');
    expect(entry).toHaveProperty('High');
    expect(entry).toHaveProperty('Medium');
    expect(entry).toHaveProperty('Low');
    expect(entry).toHaveProperty('Trivial');
  });
});

// ─── GET /api/analytics/avg-dev-to-live ──────────────────────────────────────

describe('GET /api/analytics/avg-dev-to-live', () => {
  it('returns null avg_hours and 0 count when no live bugs exist', async () => {
    await insertBug({ progress: 'Not Started', estimated_fix_hours: 5 });

    const res = await request(app).get('/api/analytics/avg-dev-to-live');
    expect(res.status).toBe(200);
    expect(res.body.avg_hours).toBeNull();
    expect(res.body.live_count).toBe(0);
  });

  it('calculates correct average for live bugs', async () => {
    await insertBug({ progress: 'Live', estimated_fix_hours: 4 });
    await insertBug({ progress: 'Live', estimated_fix_hours: 8 });
    await insertBug({ progress: 'Live', estimated_fix_hours: 12 });
    await insertBug({ progress: 'Not Started', estimated_fix_hours: 100 }); // should be excluded

    const res = await request(app).get('/api/analytics/avg-dev-to-live');
    expect(res.status).toBe(200);
    expect(res.body.avg_hours).toBe(8);
    expect(res.body.live_count).toBe(3);
  });

  it('rounds avg_hours to 2 decimal places', async () => {
    await insertBug({ progress: 'Live', estimated_fix_hours: 1 });
    await insertBug({ progress: 'Live', estimated_fix_hours: 2 });
    await insertBug({ progress: 'Live', estimated_fix_hours: 2 });

    const res = await request(app).get('/api/analytics/avg-dev-to-live');
    expect(res.status).toBe(200);
    // 5 / 3 = 1.666... -> rounded to 1.67
    expect(res.body.avg_hours).toBe(1.67);
  });
});

// ─── GET /api/analytics/funnel ───────────────────────────────────────────────

describe('GET /api/analytics/funnel', () => {
  it('returns all 6 stages in funnel order', async () => {
    const res = await request(app).get('/api/analytics/funnel');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    const stages = res.body.map((item: { stage: string }) => item.stage);
    expect(stages).toEqual([
      'Not Started',
      'In Development',
      'In Code Review',
      'In QA',
      'Ready for Release',
      'Live',
    ]);
  });

  it('returns correct counts for each stage', async () => {
    await insertBug({ progress: 'Not Started' });
    await insertBug({ progress: 'Not Started' });
    await insertBug({ progress: 'In Development' });
    await insertBug({ progress: 'Live' });

    const res = await request(app).get('/api/analytics/funnel');
    const byStage = Object.fromEntries(
      res.body.map((item: { stage: string; count: number }) => [item.stage, item.count])
    );
    expect(byStage['Not Started']).toBe(2);
    expect(byStage['In Development']).toBe(1);
    expect(byStage['In Code Review']).toBe(0);
    expect(byStage['Live']).toBe(1);
  });

  it('each entry includes an order field matching stage index', async () => {
    const res = await request(app).get('/api/analytics/funnel');
    res.body.forEach((item: { order: number }, idx: number) => {
      expect(item.order).toBe(idx);
    });
  });
});
