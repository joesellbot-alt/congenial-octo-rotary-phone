import { analyzeRequirements } from './analyzer.js';
import { generateEntities } from '../generator/entities.js';
import { generatePages } from '../generator/pages.js';
import { generateApiRoutes } from '../generator/api-routes.js';
import { generateFeatureCode } from '../generator/features.js';
import { assembleProject } from '../generator/assembler.js';

export async function generateApp({ message, projectId, history }) {
  const requirements = await analyzeRequirements(message, history);

  const entities = generateEntities(requirements.entities);
  const pages = generatePages(requirements.pages, entities);
  const apiRoutes = generateApiRoutes(entities);
  const featureCode = generateFeatureCode(requirements.features);

  const generatedCode = assembleProject({
    projectName: requirements.projectName,
    entities,
    pages,
    apiRoutes,
    featureCode,
    config: requirements.config,
  });

  const generatedFiles = Object.keys(generatedCode);

  const message_response = buildResponseMessage(requirements, generatedFiles);

  return {
    projectId,
    projectName: requirements.projectName,
    projectDescription: requirements.description,
    message: message_response,
    generatedFiles,
    generatedCode,
    entities: requirements.entities,
    pages: requirements.pages,
    features: requirements.features,
  };
}

function buildResponseMessage(requirements, files) {
  const sections = [
    `## ${requirements.projectName}\n`,
    `${requirements.description}\n`,
    `### Generated Structure\n`,
    `**Entities (${requirements.entities.length}):**`,
    ...requirements.entities.map((e) => `- \`${e.name}\` — ${e.fields.length} fields`),
    '',
    `**Pages (${requirements.pages.length}):**`,
    ...requirements.pages.map((p) => `- \`${p.name}\` → \`${p.route}\``),
    '',
    `**Features:** ${requirements.features.join(', ')}`,
    '',
    `**Files generated:** ${files.length}`,
    '',
    '### Next Steps',
    '- Ask me to add more features or modify existing ones',
    '- Request UI changes or new pages',
    '- Deploy your app when ready',
  ];

  return sections.join('\n');
}
