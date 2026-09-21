import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

app.use(cors());
app.use(express.json());

// Only genuinely public media is served statically. Sensitive academic files
// (iVault documents + course materials) are NOT here — they go through the
// authenticated, access-checked route at /api/files/:id/download.
const uploadsRoot = path.resolve(env.uploadDir);
for (const publicDir of ['avatars', 'posts', 'reels', 'stories']) {
  app.use(`/uploads/${publicDir}`, express.static(path.join(uploadsRoot, publicDir)));
}

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'icollege-api' });
});

app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
