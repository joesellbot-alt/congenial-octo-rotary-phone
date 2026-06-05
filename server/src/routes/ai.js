import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/database.js';
import { generateApp } from '../ai/orchestrator.js';
import { broadcast } from '../utils/websocket.js';

export const aiRouter = Router();

aiRouter.post('/generate', async (req, res) => {
  try {
    const { message, projectId, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const db = getDb();
    let currentProjectId = projectId;

    if (!currentProjectId) {
      currentProjectId = uuidv4();
      db.prepare(
        `INSERT INTO projects (id, user_id, name, description, status)
         VALUES (?, ?, ?, ?, 'generating')`
      ).run(currentProjectId, req.user.id, 'New App', message.slice(0, 200));
    }

    db.prepare('INSERT INTO messages (id, project_id, role, content) VALUES (?, ?, ?, ?)').run(
      uuidv4(),
      currentProjectId,
      'user',
      message
    );

    broadcast('generation:start', { projectId: currentProjectId });

    const result = await generateApp({
      message,
      projectId: currentProjectId,
      history: history || [],
      userId: req.user.id,
    });

    db.prepare(
      `UPDATE projects SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        entities = ?,
        pages = ?,
        features = ?,
        generated_code = ?,
        status = 'ready',
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      result.projectName || null,
      result.projectDescription || null,
      JSON.stringify(result.entities || []),
      JSON.stringify(result.pages || []),
      JSON.stringify(result.features || []),
      JSON.stringify(result.generatedCode || {}),
      currentProjectId
    );

    db.prepare('INSERT INTO messages (id, project_id, role, content, metadata) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(),
      currentProjectId,
      'assistant',
      result.message,
      JSON.stringify({ generatedFiles: result.generatedFiles })
    );

    broadcast('generation:complete', { projectId: currentProjectId });

    res.json({
      projectId: currentProjectId,
      message: result.message,
      generatedFiles: result.generatedFiles,
      entities: result.entities,
      pages: result.pages,
    });
  } catch (error) {
    broadcast('generation:error', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});
