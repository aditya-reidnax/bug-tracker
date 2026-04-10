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

// Helper to insert a bug directly for test setup
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
  const res = await testPool.query(
    `INSERT INTO bugs (title, severity, progress, reporter_name, estimated_fix_hours, date_reported)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [b.title, b.severity, b.progress, b.reporter_name, b.estimated_fix_hours, b.date_reported]
  );
  return res.rows[0];
}

// ─── POST /api/bugs ──────────────────────────────────────────────────────────

describe('POST /api/bugs', () => {
  it('creates a bug with valid data and returns 201', async () => {
    const payload = {
      title: 'Login crash',
      severity: 'Critical',
      progress: 'Not Started',
      reporter_name: 'Alice',
      estimated_fix_hours: 4,
      date_reported: '2026-04-10',
    };

    const res = await request(app).post('/api/bugs').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Login crash');
    expect(res.body.severity).toBe('Critical');
    expect(res.body.progress).toBe('Not Started');
    expect(res.body.reporter_name).toBe('Alice');
    expect(parseFloat(res.body.estimated_fix_hours)).toBe(4);
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/bugs').send({ title: 'Incomplete bug' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All fields are required');
  });

  it('returns 400 for invalid severity value', async () => {
    const res = await request(app).post('/api/bugs').send({
      title: 'Bad severity',
      severity: 'Blocker',
      progress: 'Not Started',
      reporter_name: 'Bob',
      estimated_fix_hours: 1,
      date_reported: '2026-04-10',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid severity value');
  });

  it('returns 400 for invalid progress value', async () => {
    const res = await request(app).post('/api/bugs').send({
      title: 'Bad progress',
      severity: 'High',
      progress: 'Done',
      reporter_name: 'Bob',
      estimated_fix_hours: 1,
      date_reported: '2026-04-10',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid progress value');
  });

  it('accepts all valid severity values', async () => {
    const severities = ['Critical', 'High', 'Medium', 'Low', 'Trivial'];
    for (const severity of severities) {
      const res = await request(app).post('/api/bugs').send({
        title: `${severity} bug`,
        severity,
        progress: 'Not Started',
        reporter_name: 'Tester',
        estimated_fix_hours: 1,
        date_reported: '2026-04-10',
      });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all valid progress stages', async () => {
    const stages = ['Not Started', 'In Development', 'In Code Review', 'In QA', 'Ready for Release', 'Live'];
    for (const progress of stages) {
      const res = await request(app).post('/api/bugs').send({
        title: `Bug at ${progress}`,
        severity: 'Low',
        progress,
        reporter_name: 'Tester',
        estimated_fix_hours: 1,
        date_reported: '2026-04-10',
      });
      expect(res.status).toBe(201);
    }
  });
});

// ─── GET /api/bugs ───────────────────────────────────────────────────────────

describe('GET /api/bugs', () => {
  beforeEach(async () => {
    await insertBug({ severity: 'Critical', progress: 'Not Started', reporter_name: 'Alice', date_reported: '2026-04-10' });
    await insertBug({ severity: 'High',     progress: 'In Development', reporter_name: 'Bob', date_reported: '2026-04-09' });
    await insertBug({ severity: 'Medium',   progress: 'In QA',          reporter_name: 'Alice', date_reported: '2026-04-08' });
    await insertBug({ severity: 'Low',      progress: 'Live',            reporter_name: 'Carol', date_reported: '2026-03-01' });
    await insertBug({ severity: 'Trivial',  progress: 'Live',            reporter_name: 'Carol', date_reported: '2026-03-01' });
  });

  it('returns all bugs with no filters', async () => {
    const res = await request(app).get('/api/bugs');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
  });

  it('filters by single progress value', async () => {
    const res = await request(app).get('/api/bugs?progress=Live');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((b: { progress: string }) => expect(b.progress).toBe('Live'));
  });

  it('filters by multiple progress values', async () => {
    const res = await request(app).get('/api/bugs?progress=Not+Started&progress=In+Development');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters by single severity value', async () => {
    const res = await request(app).get('/api/bugs?severity=Critical');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].severity).toBe('Critical');
  });

  it('filters by multiple severity values', async () => {
    const res = await request(app).get('/api/bugs?severity=Critical&severity=High');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('filters by reporter_name', async () => {
    const res = await request(app).get('/api/bugs?reporter_name=Alice');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((b: { reporter_name: string }) => expect(b.reporter_name).toBe('Alice'));
  });

  it('filters by date_range=this_week returns only recent bugs', async () => {
    const res = await request(app).get('/api/bugs?date_range=this_week');
    expect(res.status).toBe(200);
    // The 3 bugs from April 2026 are within the last 7 days of 2026-04-10
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    // The 2 bugs from March 2026 should not be included
    res.body.forEach((b: { date_reported: string }) => {
      const date = new Date(b.date_reported);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(3); // April = month index 3
    });
  });

  it('combines severity and progress filters', async () => {
    const res = await request(app).get('/api/bugs?severity=Low&progress=Live');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].severity).toBe('Low');
    expect(res.body[0].progress).toBe('Live');
  });

  it('returns results ordered by date_reported descending', async () => {
    const res = await request(app).get('/api/bugs');
    expect(res.status).toBe(200);
    const dates = res.body.map((b: { date_reported: string }) => b.date_reported);
    const sorted = [...dates].sort((a: string, b: string) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it('returns empty array when no bugs match filters', async () => {
    const res = await request(app).get('/api/bugs?severity=Trivial&progress=In+Development');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

// ─── GET /api/bugs/reporters ─────────────────────────────────────────────────

describe('GET /api/bugs/reporters', () => {
  it('returns empty array when no bugs exist', async () => {
    const res = await request(app).get('/api/bugs/reporters');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns unique reporter names sorted alphabetically', async () => {
    await insertBug({ reporter_name: 'Zara' });
    await insertBug({ reporter_name: 'Alice' });
    await insertBug({ reporter_name: 'Alice' }); // duplicate
    await insertBug({ reporter_name: 'Bob' });

    const res = await request(app).get('/api/bugs/reporters');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['Alice', 'Bob', 'Zara']);
  });
});

// ─── GET /health ─────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
