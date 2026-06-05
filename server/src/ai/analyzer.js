import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are an AI app architecture planner. Given a user's description of an app they want to build, analyze it and return a structured JSON plan.

Return ONLY valid JSON with this structure:
{
  "projectName": "string - short name for the project",
  "description": "string - one sentence description",
  "entities": [
    {
      "name": "string - PascalCase entity name",
      "fields": [
        { "name": "string", "type": "string|number|boolean|date|relation|file|json", "required": boolean, "relation": "EntityName?" }
      ]
    }
  ],
  "pages": [
    { "name": "string - page name", "route": "string - URL path", "description": "string", "entities": ["string - entity names used"] }
  ],
  "features": ["string - feature keys: auth, database, payments, email, storage, realtime, analytics"],
  "config": {
    "theme": "light|dark",
    "layout": "sidebar|topnav"
  }
}

Rules:
- Always include an "auth" feature and appropriate User entity
- Infer entities from the description (users, products, orders, tasks, etc.)
- Infer pages from common app patterns (dashboard, list views, detail views, settings)
- Include "database" in features always
- Only include "payments" if the app involves money/subscriptions
- Only include "email" if notifications or messaging are mentioned
- Only include "storage" if files/images are mentioned
- Only include "realtime" if live updates are mentioned`;

export async function analyzeRequirements(message, history) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return analyzeWithHeuristics(message);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return normalizeRequirements(result);
  } catch (_error) {
    return analyzeWithHeuristics(message);
  }
}

function analyzeWithHeuristics(message) {
  const lower = message.toLowerCase();

  const projectName = extractProjectName(lower);
  const entities = inferEntities(lower);
  const pages = inferPages(entities, lower);
  const features = inferFeatures(lower);

  return normalizeRequirements({
    projectName,
    description: message.slice(0, 200),
    entities,
    pages,
    features,
    config: { theme: 'light', layout: 'sidebar' },
  });
}

function extractProjectName(text) {
  const patterns = [
    /build (?:me |a |an )?(.+?)(?:\s+(?:app|application|platform|tool|system|website))/i,
    /create (?:me |a |an )?(.+?)(?:\s+(?:app|application|platform|tool|system|website))/i,
    /(.+?)(?:\s+(?:app|application|platform|tool|system|website))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1]
        .replace(/^(a|an|the)\s+/i, '')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
  return 'My App';
}

function inferEntities(text) {
  const entityPatterns = {
    Task: ['task', 'todo', 'item', 'ticket'],
    Project: ['project', 'workspace', 'board'],
    Product: ['product', 'item', 'goods', 'merchandise'],
    Order: ['order', 'purchase', 'checkout', 'cart'],
    Contact: ['contact', 'lead', 'customer', 'client'],
    Message: ['message', 'chat', 'conversation'],
    Event: ['event', 'appointment', 'booking', 'meeting', 'schedule'],
    Article: ['article', 'post', 'blog', 'content', 'page', 'document'],
    Category: ['category', 'tag', 'label', 'group'],
    Comment: ['comment', 'review', 'feedback', 'note'],
    Invoice: ['invoice', 'bill', 'payment'],
    Team: ['team', 'group', 'organization'],
  };

  const entityFieldTemplates = {
    Task: [
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'status', type: 'string', required: true },
      { name: 'priority', type: 'string', required: false },
      { name: 'dueDate', type: 'date', required: false },
      { name: 'assigneeId', type: 'relation', required: false, relation: 'User' },
    ],
    Project: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'status', type: 'string', required: true },
      { name: 'startDate', type: 'date', required: false },
      { name: 'endDate', type: 'date', required: false },
    ],
    Product: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'price', type: 'number', required: true },
      { name: 'imageUrl', type: 'file', required: false },
      { name: 'categoryId', type: 'relation', required: false, relation: 'Category' },
      { name: 'inStock', type: 'boolean', required: true },
    ],
    Order: [
      { name: 'status', type: 'string', required: true },
      { name: 'total', type: 'number', required: true },
      { name: 'items', type: 'json', required: true },
      { name: 'customerId', type: 'relation', required: true, relation: 'User' },
      { name: 'shippingAddress', type: 'string', required: false },
    ],
    Contact: [
      { name: 'name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'phone', type: 'string', required: false },
      { name: 'company', type: 'string', required: false },
      { name: 'status', type: 'string', required: true },
      { name: 'notes', type: 'string', required: false },
    ],
    Message: [
      { name: 'content', type: 'string', required: true },
      { name: 'senderId', type: 'relation', required: true, relation: 'User' },
      { name: 'channelId', type: 'string', required: false },
      { name: 'read', type: 'boolean', required: true },
    ],
    Event: [
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'startTime', type: 'date', required: true },
      { name: 'endTime', type: 'date', required: true },
      { name: 'location', type: 'string', required: false },
      { name: 'attendees', type: 'json', required: false },
    ],
    Article: [
      { name: 'title', type: 'string', required: true },
      { name: 'content', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'published', type: 'boolean', required: true },
      { name: 'authorId', type: 'relation', required: true, relation: 'User' },
    ],
    Category: [
      { name: 'name', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
    ],
    Comment: [
      { name: 'content', type: 'string', required: true },
      { name: 'authorId', type: 'relation', required: true, relation: 'User' },
      { name: 'parentId', type: 'string', required: false },
    ],
    Invoice: [
      { name: 'amount', type: 'number', required: true },
      { name: 'status', type: 'string', required: true },
      { name: 'dueDate', type: 'date', required: true },
      { name: 'customerId', type: 'relation', required: true, relation: 'User' },
      { name: 'items', type: 'json', required: true },
    ],
    Team: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'members', type: 'json', required: false },
    ],
  };

  const foundEntities = [
    {
      name: 'User',
      fields: [
        { name: 'email', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'role', type: 'string', required: true },
        { name: 'avatarUrl', type: 'file', required: false },
      ],
    },
  ];

  for (const [entityName, keywords] of Object.entries(entityPatterns)) {
    if (keywords.some((kw) => text.includes(kw))) {
      foundEntities.push({
        name: entityName,
        fields: entityFieldTemplates[entityName] || [
          { name: 'name', type: 'string', required: true },
        ],
      });
    }
  }

  if (foundEntities.length === 1) {
    foundEntities.push({
      name: 'Item',
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'string', required: false },
        { name: 'status', type: 'string', required: true },
        { name: 'createdBy', type: 'relation', required: true, relation: 'User' },
      ],
    });
  }

  return foundEntities;
}

function inferPages(entities, text) {
  const pages = [{ name: 'Dashboard', route: '/', description: 'Main dashboard', entities: [] }];

  for (const entity of entities) {
    if (entity.name === 'User') continue;
    const plural = entity.name.toLowerCase() + 's';
    pages.push({
      name: `${entity.name}List`,
      route: `/${plural}`,
      description: `List all ${plural}`,
      entities: [entity.name],
    });
    pages.push({
      name: `${entity.name}Detail`,
      route: `/${plural}/:id`,
      description: `View/edit ${entity.name.toLowerCase()}`,
      entities: [entity.name],
    });
  }

  if (text.includes('setting') || text.includes('profile')) {
    pages.push({ name: 'Settings', route: '/settings', description: 'User settings', entities: ['User'] });
  }

  return pages;
}

function inferFeatures(text) {
  const features = ['auth', 'database'];

  if (/pay|stripe|checkout|subscri|billing|price/.test(text)) features.push('payments');
  if (/email|notification|send|alert|newsletter/.test(text)) features.push('email');
  if (/file|upload|image|photo|document|storage|attach/.test(text)) features.push('storage');
  if (/real.?time|live|chat|collaborat|socket|instant/.test(text)) features.push('realtime');
  if (/analytic|metric|dashboard|chart|report|track/.test(text)) features.push('analytics');

  return features;
}

function normalizeRequirements(req) {
  return {
    projectName: req.projectName || 'My App',
    description: req.description || '',
    entities: req.entities || [],
    pages: req.pages || [],
    features: req.features || ['auth', 'database'],
    config: req.config || { theme: 'light', layout: 'sidebar' },
  };
}
