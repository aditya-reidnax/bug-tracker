import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  const dbUrl = process.env.TEST_DATABASE_URL ?? 'postgres://postgres:password@localhost:5432/bug_tracker_test';
  const migrationPath = path.resolve(__dirname, '../../../migrations/001_create_bugs.sql');

  try {
    execSync('createdb bug_tracker_test 2>/dev/null || true');
  } catch {
    // DB may already exist — that's fine
  }

  execSync(`psql "${dbUrl}" -f "${migrationPath}"`);
}
