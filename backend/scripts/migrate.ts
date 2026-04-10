import * as fs from 'fs';
import * as path from 'path';
import pool from '../src/db';

async function migrate() {
  const sqlPath = path.join(__dirname, '..', 'migrations', '001_create_bugs.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running migration...');
  await pool.query(sql);
  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
