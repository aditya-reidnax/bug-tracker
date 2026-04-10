import pool from '../src/db';

const bugs = [
  // Critical bugs across all stages
  {
    title: 'App crashes on login with SSO token expiry',
    severity: 'Critical',
    progress: 'Not Started',
    reporter_name: 'Alice Chen',
    estimated_fix_hours: 8,
    date_reported: '2026-04-10',
  },
  {
    title: 'Payment gateway returns 500 on checkout',
    severity: 'Critical',
    progress: 'In Development',
    reporter_name: 'Bob Martinez',
    estimated_fix_hours: 12,
    date_reported: '2026-04-08',
  },
  {
    title: 'Database connection pool exhaustion under high load',
    severity: 'Critical',
    progress: 'In Code Review',
    reporter_name: 'Alice Chen',
    estimated_fix_hours: 16,
    date_reported: '2026-04-05',
  },
  {
    title: 'User sessions lost after server restart',
    severity: 'Critical',
    progress: 'In QA',
    reporter_name: 'David Kim',
    estimated_fix_hours: 6,
    date_reported: '2026-04-01',
  },
  {
    title: 'Data corruption in bulk import for CSV files over 10MB',
    severity: 'Critical',
    progress: 'Ready for Release',
    reporter_name: 'Emma Thompson',
    estimated_fix_hours: 20,
    date_reported: '2026-03-28',
  },
  {
    title: 'Race condition causes duplicate order submissions',
    severity: 'Critical',
    progress: 'Live',
    reporter_name: 'Bob Martinez',
    estimated_fix_hours: 10,
    date_reported: '2026-03-20',
  },

  // High severity bugs
  {
    title: 'Search results don\'t update after filter change',
    severity: 'High',
    progress: 'Not Started',
    reporter_name: 'Frank Liu',
    estimated_fix_hours: 4,
    date_reported: '2026-04-09',
  },
  {
    title: 'Notification emails sent with broken HTML template',
    severity: 'High',
    progress: 'In Development',
    reporter_name: 'Alice Chen',
    estimated_fix_hours: 3,
    date_reported: '2026-04-07',
  },
  {
    title: 'API rate limiter blocks legitimate requests after 100/min',
    severity: 'High',
    progress: 'In Code Review',
    reporter_name: 'Grace Patel',
    estimated_fix_hours: 5,
    date_reported: '2026-04-04',
  },
  {
    title: 'File upload silently fails for .xlsx files',
    severity: 'High',
    progress: 'In QA',
    reporter_name: 'David Kim',
    estimated_fix_hours: 4,
    date_reported: '2026-03-30',
  },
  {
    title: 'Pagination breaks when sorting by date descending',
    severity: 'High',
    progress: 'Live',
    reporter_name: 'Emma Thompson',
    estimated_fix_hours: 3,
    date_reported: '2026-03-22',
  },

  // Medium severity bugs
  {
    title: 'Dark mode toggle resets on page refresh',
    severity: 'Medium',
    progress: 'Not Started',
    reporter_name: 'Grace Patel',
    estimated_fix_hours: 2,
    date_reported: '2026-04-10',
  },
  {
    title: 'Profile avatar doesn\'t update without hard reload',
    severity: 'Medium',
    progress: 'In Development',
    reporter_name: 'Frank Liu',
    estimated_fix_hours: 2,
    date_reported: '2026-04-06',
  },
  {
    title: 'Date picker shows incorrect month on initial render',
    severity: 'Medium',
    progress: 'In Code Review',
    reporter_name: 'Bob Martinez',
    estimated_fix_hours: 3,
    date_reported: '2026-04-03',
  },
  {
    title: 'Table column widths reset when data reloads',
    severity: 'Medium',
    progress: 'Ready for Release',
    reporter_name: 'Alice Chen',
    estimated_fix_hours: 2,
    date_reported: '2026-03-25',
  },
  {
    title: 'Sidebar collapses unexpectedly on window resize',
    severity: 'Medium',
    progress: 'Live',
    reporter_name: 'David Kim',
    estimated_fix_hours: 1.5,
    date_reported: '2026-03-18',
  },
  {
    title: 'Export to PDF cuts off last row of data tables',
    severity: 'Medium',
    progress: 'In QA',
    reporter_name: 'Grace Patel',
    estimated_fix_hours: 4,
    date_reported: '2026-03-29',
  },

  // Low severity bugs
  {
    title: 'Tooltip text overflows on narrow viewport sizes',
    severity: 'Low',
    progress: 'Not Started',
    reporter_name: 'Emma Thompson',
    estimated_fix_hours: 1,
    date_reported: '2026-04-09',
  },
  {
    title: 'Dropdown menu doesn\'t close on outside click in Firefox',
    severity: 'Low',
    progress: 'In Development',
    reporter_name: 'Frank Liu',
    estimated_fix_hours: 1.5,
    date_reported: '2026-04-05',
  },
  {
    title: 'Loading spinner misaligned by 2px in Safari',
    severity: 'Low',
    progress: 'In Code Review',
    reporter_name: 'Grace Patel',
    estimated_fix_hours: 0.5,
    date_reported: '2026-04-02',
  },
  {
    title: 'Success toast disappears too quickly on slow connections',
    severity: 'Low',
    progress: 'Live',
    reporter_name: 'Bob Martinez',
    estimated_fix_hours: 0.5,
    date_reported: '2026-03-15',
  },

  // Trivial bugs
  {
    title: 'Typo in "Succesfully saved" confirmation message',
    severity: 'Trivial',
    progress: 'Not Started',
    reporter_name: 'David Kim',
    estimated_fix_hours: 0.25,
    date_reported: '2026-04-10',
  },
  {
    title: 'Footer copyright year still shows 2024',
    severity: 'Trivial',
    progress: 'In Development',
    reporter_name: 'Alice Chen',
    estimated_fix_hours: 0.25,
    date_reported: '2026-04-07',
  },
  {
    title: 'Help page FAQ section has incorrect anchor links',
    severity: 'Trivial',
    progress: 'Ready for Release',
    reporter_name: 'Emma Thompson',
    estimated_fix_hours: 0.5,
    date_reported: '2026-03-27',
  },
  {
    title: 'Button hover color slightly off from design spec',
    severity: 'Trivial',
    progress: 'Live',
    reporter_name: 'Frank Liu',
    estimated_fix_hours: 0.25,
    date_reported: '2026-03-10',
  },

  // Extra bugs spread across older weeks for chart variety
  {
    title: 'WebSocket disconnects after 5 minutes of inactivity',
    severity: 'High',
    progress: 'Not Started',
    reporter_name: 'David Kim',
    estimated_fix_hours: 6,
    date_reported: '2026-03-31',
  },
  {
    title: 'Bulk delete fails silently when selection exceeds 50 items',
    severity: 'Critical',
    progress: 'In Development',
    reporter_name: 'Grace Patel',
    estimated_fix_hours: 8,
    date_reported: '2026-03-24',
  },
  {
    title: 'Chart legends overlap on mobile screen sizes',
    severity: 'Low',
    progress: 'Not Started',
    reporter_name: 'Frank Liu',
    estimated_fix_hours: 2,
    date_reported: '2026-03-17',
  },
  {
    title: 'Password reset link expires too quickly (10 min)',
    severity: 'High',
    progress: 'In QA',
    reporter_name: 'Emma Thompson',
    estimated_fix_hours: 2,
    date_reported: '2026-03-10',
  },
  {
    title: 'Multi-language support broken for RTL text direction',
    severity: 'Medium',
    progress: 'In Development',
    reporter_name: 'Bob Martinez',
    estimated_fix_hours: 10,
    date_reported: '2026-03-03',
  },
];

async function seed() {
  console.log(`Seeding ${bugs.length} bugs...`);
  let inserted = 0;

  for (const bug of bugs) {
    await pool.query(
      `INSERT INTO bugs (title, severity, progress, reporter_name, estimated_fix_hours, date_reported)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bug.title, bug.severity, bug.progress, bug.reporter_name, bug.estimated_fix_hours, bug.date_reported]
    );
    inserted++;
  }

  console.log(`✓ Inserted ${inserted} bugs successfully`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
