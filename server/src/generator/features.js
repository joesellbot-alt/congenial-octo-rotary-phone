export function generateFeatureCode(features) {
  const files = {};

  for (const feature of features) {
    const generator = featureGenerators[feature];
    if (generator) {
      Object.assign(files, generator());
    }
  }

  return files;
}

const featureGenerators = {
  auth: generateAuthFeature,
  database: generateDatabaseFeature,
  payments: generatePaymentsFeature,
  email: generateEmailFeature,
  storage: generateStorageFeature,
  realtime: generateRealtimeFeature,
  analytics: generateAnalyticsFeature,
};

function generateAuthFeature() {
  return {
    'src/lib/auth.js': `import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
`,
    'src/middleware/auth.js': `import { verifyToken } from '../lib/auth.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch (_err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
`,
    'src/routes/auth.js': `import { Router } from 'express';
import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../lib/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const existing = User.list({ email });
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = User.create({ email, name: name || email.split('@')[0], role: 'user', password_hash: hashPassword(password) });
    const token = generateToken(user);
    res.status(201).json({ user: { id: user.id, email, name: user.name, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = User.list({ email });
    const user = users[0];
    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`,
    'src/components/AuthProvider.jsx': `import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(({ user }) => setUser(user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { user, token } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async (email, password, name) => {
    const { user, token } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
`,
  };
}

function generateDatabaseFeature() {
  return {
    'src/lib/database.js': `import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/app.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}
`,
  };
}

function generatePaymentsFeature() {
  return {
    'src/lib/payments.js': `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession({ items, successUrl, cancelUrl, customerId }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name, description: item.description },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    })),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
  });
  return session;
}

export async function createSubscription({ customerId, priceId }) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  return subscription;
}

export async function handleWebhook(body, signature) {
  const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  return event;
}
`,
    'src/routes/payments.js': `import { Router } from 'express';
import { createCheckoutSession, handleWebhook } from '../lib/payments.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;
    const session = await createCheckoutSession({ items, successUrl, cancelUrl });
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const event = await handleWebhook(req.body, req.headers['stripe-signature']);
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful payment
        break;
      case 'invoice.paid':
        // Handle subscription payment
        break;
    }
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
`,
  };
}

function generateEmailFeature() {
  return {
    'src/lib/email.js': `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@app.com',
    to,
    subject,
    html,
    text,
  });
  return info;
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to the app!',
    html: \`<h1>Welcome, \${user.name}!</h1><p>Your account has been created successfully.</p>\`,
  });
}

export async function sendNotification({ to, title, message }) {
  return sendEmail({
    to,
    subject: title,
    html: \`<h2>\${title}</h2><p>\${message}</p>\`,
  });
}
`,
  };
}

function generateStorageFeature() {
  return {
    'src/lib/storage.js': `import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, '../../uploads');

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function saveFile(buffer, originalName) {
  const ext = originalName.split('.').pop();
  const fileName = \`\${crypto.randomUUID()}.\${ext}\`;
  const filePath = join(UPLOAD_DIR, fileName);
  writeFileSync(filePath, buffer);
  return { fileName, filePath, url: \`/uploads/\${fileName}\` };
}

export function deleteFile(fileName) {
  const filePath = join(UPLOAD_DIR, fileName);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export function getUploadDir() {
  return UPLOAD_DIR;
}
`,
    'src/routes/uploads.js': `import { Router } from 'express';
import multer from 'multer';
import { saveFile, deleteFile } from '../lib/storage.js';
import { authMiddleware } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = saveFile(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:fileName', authMiddleware, (req, res) => {
  try {
    deleteFile(req.params.fileName);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`,
  };
}

function generateRealtimeFeature() {
  return {
    'src/lib/realtime.js': `import { WebSocketServer } from 'ws';

let wss;
const rooms = new Map();

export function initRealtime(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'join') {
          joinRoom(ws, msg.room);
        } else if (msg.type === 'leave') {
          leaveRoom(ws, msg.room);
        }
      } catch (_err) {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      for (const [room, clients] of rooms) {
        clients.delete(ws);
        if (clients.size === 0) rooms.delete(room);
      }
    });
  });
}

function joinRoom(ws, room) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);
}

function leaveRoom(ws, room) {
  rooms.get(room)?.delete(ws);
}

export function broadcast(room, event, data) {
  const clients = rooms.get(room);
  if (!clients) return;
  const message = JSON.stringify({ event, data });
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(message);
  }
}

export function broadcastAll(event, data) {
  if (!wss) return;
  const message = JSON.stringify({ event, data });
  for (const ws of wss.clients) {
    if (ws.readyState === 1) ws.send(message);
  }
}
`,
  };
}

function generateAnalyticsFeature() {
  return {
    'src/lib/analytics.js': `import { getDb } from './database.js';

export function initAnalytics() {
  const db = getDb();
  db.exec(\`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      user_id TEXT,
      properties TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    )
  \`);
}

export function trackEvent(eventName, userId, properties = {}) {
  const db = getDb();
  db.prepare(
    'INSERT INTO analytics_events (id, event_name, user_id, properties) VALUES (hex(randomblob(16)), ?, ?, ?)'
  ).run(eventName, userId, JSON.stringify(properties));
}

export function getEvents({ eventName, userId, startDate, endDate, limit = 100 } = {}) {
  const db = getDb();
  let query = 'SELECT * FROM analytics_events WHERE 1=1';
  const params = [];

  if (eventName) { query += ' AND event_name = ?'; params.push(eventName); }
  if (userId) { query += ' AND user_id = ?'; params.push(userId); }
  if (startDate) { query += ' AND created_at >= ?'; params.push(startDate); }
  if (endDate) { query += ' AND created_at <= ?'; params.push(endDate); }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

export function getEventCounts(eventName, days = 30) {
  const db = getDb();
  return db.prepare(\`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM analytics_events
    WHERE event_name = ? AND created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  \`).all(eventName, days);
}
`,
    'src/routes/analytics.js': `import { Router } from 'express';
import { trackEvent, getEvents, getEventCounts } from '../lib/analytics.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/track', authMiddleware, (req, res) => {
  try {
    const { event, properties } = req.body;
    trackEvent(event, req.user.id, properties);
    res.json({ tracked: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/events', authMiddleware, (req, res) => {
  try {
    const events = getEvents(req.query);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/counts/:event', authMiddleware, (req, res) => {
  try {
    const counts = getEventCounts(req.params.event, parseInt(req.query.days) || 30);
    res.json({ counts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`,
  };
}
