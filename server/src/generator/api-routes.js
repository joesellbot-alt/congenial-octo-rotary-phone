export function generateApiRoutes(entityFiles) {
  const files = {};
  const entityNames = Object.keys(entityFiles)
    .filter((f) => f.startsWith('entities/') && f.endsWith('.json'))
    .map((f) => f.replace('entities/', '').replace('.json', ''));

  for (const name of entityNames) {
    const plural = name.toLowerCase() + 's';
    files[`src/routes/${plural}.js`] = generateCrudRoute(name, plural);
  }

  files['src/routes/index.js'] = generateRouteIndex(entityNames);
  files['src/routes/stats.js'] = generateStatsRoute(entityNames);

  return files;
}

function generateCrudRoute(entityName, _plural) {
  return `import { Router } from 'express';
import { ${entityName} } from '../models/${entityName}.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const { limit, offset, orderBy, order, ...filters } = req.query;
    const items = ${entityName}.list(filters, {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      orderBy: orderBy || 'created_at',
      order: order || 'DESC',
    });
    const total = ${entityName}.count(filters);
    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, (req, res) => {
  try {
    const item = ${entityName}.get(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const item = ${entityName}.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = ${entityName}.get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const item = ${entityName}.update(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    ${entityName}.delete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`;
}

function generateRouteIndex(entityNames) {
  const imports = entityNames
    .map((name) => {
      const plural = name.toLowerCase() + 's';
      return `import ${plural}Router from './${plural}.js';`;
    })
    .join('\n');

  const mounts = entityNames
    .map((name) => {
      const plural = name.toLowerCase() + 's';
      return `  app.use('/api/entities/${plural}', ${plural}Router);`;
    })
    .join('\n');

  return `${imports}
import statsRouter from './stats.js';

export function mountRoutes(app) {
${mounts}
  app.use('/api/stats', statsRouter);
}
`;
}

function generateStatsRoute(entityNames) {
  const counts = entityNames
    .map((name) => {
      const plural = name.toLowerCase() + 's';
      return `    ${plural}: ${name}.count(),`;
    })
    .join('\n');

  const imports = entityNames
    .map((name) => `import { ${name} } from '../models/${name}.js';`)
    .join('\n');

  return `import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
${imports}

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  try {
    const stats = {
${counts}
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`;
}
