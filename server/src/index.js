import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { initDatabase } from './utils/database.js';
import { authRouter } from './routes/auth.js';
import { projectsRouter } from './routes/projects.js';
import { aiRouter } from './routes/ai.js';
import { settingsRouter } from './routes/settings.js';
import { deployRouter } from './routes/deploy.js';
import { authMiddleware } from './middleware/auth.js';
import { setupWebSocket } from './utils/websocket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

initDatabase();

app.use('/api/auth', authRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/settings', authMiddleware, settingsRouter);
app.use('/api/deploy', authMiddleware, deployRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
