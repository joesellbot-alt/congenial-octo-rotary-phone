import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../../generated');

export async function deployProject(project) {
  const projectDir = join(OUTPUT_DIR, project.id);

  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
  }

  const generatedCode = JSON.parse(project.generated_code || '{}');

  for (const [filePath, content] of Object.entries(generatedCode)) {
    const fullPath = join(projectDir, filePath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, content);
  }

  const port = 3000 + Math.floor(Math.random() * 7000);
  const url = `http://localhost:${port}`;

  return {
    url,
    projectDir,
    port,
  };
}

export function getProjectDir(projectId) {
  return join(OUTPUT_DIR, projectId);
}
