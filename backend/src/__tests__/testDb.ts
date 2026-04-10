import { Pool } from 'pg';

const testPool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL ?? 'postgres://postgres:password@localhost:5432/bug_tracker_test',
});

export default testPool;
