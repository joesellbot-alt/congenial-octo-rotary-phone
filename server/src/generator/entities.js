export function generateEntities(entityDefs) {
  const files = {};

  for (const entity of entityDefs) {
    const schemaFile = generateEntitySchema(entity);
    files[`entities/${entity.name}.json`] = schemaFile;

    const modelFile = generateEntityModel(entity);
    files[`src/models/${entity.name}.js`] = modelFile;
  }

  files['src/models/index.js'] = generateModelIndex(entityDefs);

  return files;
}

function generateEntitySchema(entity) {
  const schema = {
    name: entity.name,
    fields: entity.fields.map((f) => ({
      name: f.name,
      type: f.type,
      required: f.required || false,
      ...(f.relation && { relation: f.relation }),
    })),
    timestamps: true,
  };

  return JSON.stringify(schema, null, 2);
}

function generateEntityModel(entity) {
  const tableName = entity.name.toLowerCase() + 's';
  const fieldDefs = entity.fields
    .map((f) => {
      const sqlType = getSqlType(f.type);
      const nullable = f.required ? 'NOT NULL' : '';
      return `      ${f.name} ${sqlType} ${nullable}`.trimEnd();
    })
    .join(',\n');

  const validColumns = JSON.stringify(['id', ...entity.fields.map((f) => f.name), 'created_at', 'updated_at']);

  return `import { getDb } from '../lib/database.js';

const TABLE = '${tableName}';
const VALID_COLUMNS = ${validColumns};
const VALID_ORDER = ['ASC', 'DESC'];

export const ${entity.name} = {
  init() {
    const db = getDb();
    db.exec(\`
      CREATE TABLE IF NOT EXISTS \${TABLE} (
        id TEXT PRIMARY KEY,
${fieldDefs},
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    \`);
  },

  list(filters = {}, { limit = 50, offset = 0, orderBy = 'created_at', order = 'DESC' } = {}) {
    const db = getDb();
    const safeOrderBy = VALID_COLUMNS.includes(orderBy) ? orderBy : 'created_at';
    const safeOrder = VALID_ORDER.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    let query = \`SELECT * FROM \${TABLE}\`;
    const params = [];
    const conditions = [];

    for (const [key, value] of Object.entries(filters)) {
      if (!VALID_COLUMNS.includes(key)) continue;
      conditions.push(\`\${key} = ?\`);
      params.push(value);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += \` ORDER BY \${safeOrderBy} \${safeOrder} LIMIT ? OFFSET ?\`;
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  },

  get(id) {
    const db = getDb();
    return db.prepare(\`SELECT * FROM \${TABLE} WHERE id = ?\`).get(id);
  },

  create(data) {
    const db = getDb();
    const id = crypto.randomUUID();
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((f) => data[f]);

    db.prepare(
      \`INSERT INTO \${TABLE} (id, \${fields.join(', ')}) VALUES (?, \${placeholders})\`
    ).run(id, ...values);

    return { id, ...data };
  },

  update(id, data) {
    const db = getDb();
    const fields = Object.keys(data);
    const setClause = fields.map((f) => \`\${f} = ?\`).join(', ');
    const values = fields.map((f) => data[f]);

    db.prepare(
      \`UPDATE \${TABLE} SET \${setClause}, updated_at = datetime('now') WHERE id = ?\`
    ).run(...values, id);

    return { id, ...data };
  },

  delete(id) {
    const db = getDb();
    db.prepare(\`DELETE FROM \${TABLE} WHERE id = ?\`).run(id);
    return { deleted: true };
  },

  count(filters = {}) {
    const db = getDb();
    let query = \`SELECT COUNT(*) as count FROM \${TABLE}\`;
    const params = [];
    const conditions = [];

    for (const [key, value] of Object.entries(filters)) {
      conditions.push(\`\${key} = ?\`);
      params.push(value);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    return db.prepare(query).get(...params).count;
  },
};
`;
}

function generateModelIndex(entities) {
  const imports = entities.map((e) => `import { ${e.name} } from './${e.name}.js';`).join('\n');
  const exports = entities.map((e) => `  ${e.name},`).join('\n');
  const inits = entities.map((e) => `  ${e.name}.init();`).join('\n');

  return `${imports}

export const models = {
${exports}
};

export function initModels() {
${inits}
}
`;
}

function getSqlType(type) {
  const typeMap = {
    string: 'TEXT',
    number: 'REAL',
    boolean: 'INTEGER',
    date: 'TEXT',
    relation: 'TEXT',
    file: 'TEXT',
    json: 'TEXT',
  };
  return typeMap[type] || 'TEXT';
}
