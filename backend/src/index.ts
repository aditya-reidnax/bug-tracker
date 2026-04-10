import dotenv from 'dotenv';
dotenv.config();

import pool from './db';
import { createApp } from './app';

const PORT = process.env.PORT || 3001;
const app = createApp(pool);

app.listen(PORT, () => {
  console.log(`Bug tracker API running on http://localhost:${PORT}`);
});

export default app;
