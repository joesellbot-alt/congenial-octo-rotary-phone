import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/database.js';

export const projectsRouter = Router();

projectsRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const projects = db
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
      .all(req.user.id);

    const parsed = projects.map((p) => ({
      ...p,
      entities: JSON.parse(p.entities || '[]'),
      pages: JSON.parse(p.pages || '[]'),
      features: JSON.parse(p.features || '[]'),
      config: JSON.parse(p.config || '{}'),
    }));

    res.json({ projects: parsed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

projectsRouter.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      ...project,
      entities: JSON.parse(project.entities || '[]'),
      pages: JSON.parse(project.pages || '[]'),
      features: JSON.parse(project.features || '[]'),
      config: JSON.parse(project.config || '{}'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

projectsRouter.post('/', (req, res) => {
  try {
    const { name, description, entities, pages, features, config } = req.body;
    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO projects (id, user_id, name, description, entities, pages, features, config)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      req.user.id,
      name,
      description || '',
      JSON.stringify(entities || []),
      JSON.stringify(pages || []),
      JSON.stringify(features || ['auth', 'database']),
      JSON.stringify(config || {})
    );

    res.status(201).json({ id, name, description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

projectsRouter.put('/:id', (req, res) => {
  try {
    const { name, description, entities, pages, features, config, status } = req.body;
    const db = getDb();

    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    db.prepare(
      `UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        entities = COALESCE(?, entities),
        pages = COALESCE(?, pages),
        features = COALESCE(?, features),
        config = COALESCE(?, config),
        status = COALESCE(?, status),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      name || null,
      description || null,
      entities ? JSON.stringify(entities) : null,
      pages ? JSON.stringify(pages) : null,
      features ? JSON.stringify(features) : null,
      config ? JSON.stringify(config) : null,
      status || null,
      req.params.id
    );

    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

projectsRouter.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(
      req.params.id,
      req.user.id
    );
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

projectsRouter.get('/:id/messages', (req, res) => {
  try {
    const db = getDb();
    const messages = db
      .prepare('SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC')
      .all(req.params.id);

    res.json(messages.map((m) => ({ ...m, metadata: JSON.parse(m.metadata || '{}') })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
