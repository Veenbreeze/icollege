import cors from 'cors';
import express from 'express';
import { apiRouter } from './routes/index.js';
import { mediaRouter } from './routes/media.js';
import { errorHandler } from './middleware/errorHandler.js';
import { randomUUID } from 'node:crypto';
import { env } from './config/env.js';

const app = express();

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
const devOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://localhost:19006'];
const allowedOrigins = new Set(env.corsOrigins.length ? env.corsOrigins : (env.isProduction ? [] : devOrigins));
app.use(cors({
  origin(origin, callback) { callback(null, !origin || allowedOrigins.has(origin)); },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));
app.use(express.json());
app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'icollege-api' });
});

app.use('/api/media', mediaRouter);
app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
