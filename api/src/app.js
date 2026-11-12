import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { openapi } from './docs/openapi.js';
import { isDbConnected } from './config/db.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import notesRoutes from './routes/notes.routes.js';
import postsRoutes from './routes/posts.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  }),
);
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect(302, '/docs');
});

app.get('/health', (req, res) => {
  const connected = isDbConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/notes', notesRoutes);
app.use('/posts', postsRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use(errorHandler);

export default app;
