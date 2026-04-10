-- Bug Tracker Database Migration
-- Run: psql $DATABASE_URL -f migrations/001_create_bugs.sql

CREATE TYPE severity_enum AS ENUM ('Critical', 'High', 'Medium', 'Low', 'Trivial');
CREATE TYPE progress_enum AS ENUM (
  'Not Started',
  'In Development',
  'In Code Review',
  'In QA',
  'Ready for Release',
  'Live'
);

CREATE TABLE IF NOT EXISTS bugs (
  id                  SERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  severity            severity_enum NOT NULL,
  progress            progress_enum NOT NULL DEFAULT 'Not Started',
  reporter_name       TEXT NOT NULL,
  estimated_fix_hours NUMERIC(10, 2) NOT NULL,
  date_reported       DATE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bugs_severity      ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_progress      ON bugs(progress);
CREATE INDEX IF NOT EXISTS idx_bugs_date_reported ON bugs(date_reported);
CREATE INDEX IF NOT EXISTS idx_bugs_reporter_name ON bugs(reporter_name);
