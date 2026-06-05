import { Router } from 'express';
import { getDb } from '../utils/database.js';

export const settingsRouter = Router();

settingsRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const settings = db
      .prepare('SELECT key, value FROM settings WHERE user_id = ?')
      .all(req.user.id);

    const result = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

settingsRouter.put('/', (req, res) => {
  try {
    const db = getDb();
    const entries = Object.entries(req.body);

    const upsert = db.prepare(
      `INSERT INTO settings (id, user_id, key, value)
       VALUES (hex(randomblob(16)), ?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    );

    const transaction = db.transaction(() => {
      for (const [key, value] of entries) {
        upsert.run(req.user.id, key, value);
      }
    });

    transaction();
    res.json({ message: 'Settings saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
