import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';
import { assertRequiredEnv } from './config/env.js';
import './models/index.js';

assertRequiredEnv();

const port = Number(process.env.PORT) || 3000;

await connectDb();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
