import { Router } from 'express';
import { getDb } from '../utils/database.js';
import { deployProject } from '../generator/deployer.js';

export const deployRouter = Router();

deployRouter.post('/:projectId', async (req, res) => {
  try {
    const db = getDb();
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.projectId, req.user.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await deployProject(project);

    db.prepare(
      `UPDATE projects SET deployed = 1, deploy_url = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(result.url, project.id);

    res.json({ url: result.url, status: 'deployed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

deployRouter.get('/:projectId/status', (req, res) => {
  try {
    const db = getDb();
    const project = db
      .prepare('SELECT deployed, deploy_url FROM projects WHERE id = ? AND user_id = ?')
      .get(req.params.projectId, req.user.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      deployed: Boolean(project.deployed),
      url: project.deploy_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
