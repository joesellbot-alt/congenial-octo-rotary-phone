export function assembleProject({ projectName, entities, pages, apiRoutes, featureCode, config }) {
  const files = {};

  Object.assign(files, entities);
  Object.assign(files, pages);
  Object.assign(files, apiRoutes);
  Object.assign(files, featureCode);

  files['package.json'] = generatePackageJson(projectName, Object.keys(featureCode));
  files['vite.config.js'] = generateViteConfig();
  files['tailwind.config.js'] = generateTailwindConfig();
  files['postcss.config.js'] = `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };`;
  files['index.html'] = generateHtml(projectName);
  files['.env.example'] = generateEnvExample(featureCode);
  files['src/main.jsx'] = generateMain();
  files['src/lib/api.js'] = generateApiClient();
  files['src/styles/globals.css'] = generateGlobalStyles(config);
  files['src/components/Layout.jsx'] = generateLayout(projectName, pages);
  files['README.md'] = generateReadme(projectName);
  files['src/server.js'] = generateServerEntry(Object.keys(featureCode));

  return files;
}

function generatePackageJson(name, featureFiles) {
  const deps = {
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    'react-router-dom': '^6.23.1',
    express: '^4.19.2',
    cors: '^2.8.5',
    dotenv: '^16.4.5',
    'better-sqlite3': '^11.0.0',
    bcryptjs: '^2.4.3',
    jsonwebtoken: '^9.0.2',
    uuid: '^9.0.1',
  };

  if (featureFiles.some((f) => f.includes('payments'))) {
    deps.stripe = '^15.8.0';
  }
  if (featureFiles.some((f) => f.includes('email'))) {
    deps.nodemailer = '^6.9.13';
  }
  if (featureFiles.some((f) => f.includes('storage') || f.includes('uploads'))) {
    deps.multer = '^1.4.5-lts.1';
  }
  if (featureFiles.some((f) => f.includes('realtime') || f.includes('ws'))) {
    deps.ws = '^8.17.0';
  }

  return JSON.stringify(
    {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      type: 'module',
      private: true,
      scripts: {
        dev: 'concurrently "vite" "node --watch src/server.js"',
        build: 'vite build',
        start: 'node src/server.js',
        preview: 'vite preview',
      },
      dependencies: deps,
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.0',
        autoprefixer: '^10.4.19',
        concurrently: '^8.2.2',
        postcss: '^8.4.38',
        tailwindcss: '^3.4.4',
        vite: '^5.2.12',
      },
    },
    null,
    2
  );
}

function generateViteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': { target: 'ws://localhost:4000', ws: true },
      '/uploads': 'http://localhost:4000',
    },
  },
});
`;
}

function generateTailwindConfig() {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', foreground: '#ffffff' },
      },
    },
  },
  plugins: [],
};
`;
}

function generateHtml(title) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function generateEnvExample(featureCode) {
  const lines = ['JWT_SECRET=your-secret-key', 'PORT=4000'];
  const features = Object.keys(featureCode).join(' ');

  if (features.includes('payments') || features.includes('stripe')) {
    lines.push('STRIPE_SECRET_KEY=sk_test_...', 'STRIPE_WEBHOOK_SECRET=whsec_...');
  }
  if (features.includes('email') || features.includes('smtp')) {
    lines.push('SMTP_HOST=smtp.gmail.com', 'SMTP_PORT=587', 'SMTP_USER=', 'SMTP_PASS=', 'EMAIL_FROM=noreply@app.com');
  }
  if (features.includes('openai')) {
    lines.push('OPENAI_API_KEY=sk-...');
  }

  return lines.join('\n') + '\n';
}

function generateMain() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/AuthProvider';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
`;
}

function generateApiClient() {
  return `const BASE = '/api';

export const api = {
  async request(endpoint, options = {}) {
    const url = BASE + endpoint;
    const config = { headers: { 'Content-Type': 'application/json' }, ...options };
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = \`Bearer \${token}\`;
    const res = await fetch(url, config);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message);
    }
    return res.json();
  },
  get: (url) => api.request(url),
  post: (url, data) => api.request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => api.request(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => api.request(url, { method: 'DELETE' }),
};
`;
}

function generateGlobalStyles(config) {
  const bg = config?.theme === 'dark' ? '#1a1a2e' : '#f9fafb';
  const text = config?.theme === 'dark' ? '#e2e8f0' : '#111827';

  return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: ${bg};
  color: ${text};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`;
}

function generateLayout(projectName, pages) {
  const navLinks = pages
    .filter((p) => !p.route.includes(':id'))
    .map((p) => `        <NavLink to="${p.route}" className={({isActive}) => \`px-3 py-2 rounded-md text-sm \${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'}\`}>${p.name.replace('List', '')}</NavLink>`)
    .join('\n');

  return `import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function Layout() {
  const { user, logout } = useAuth();

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">${projectName}</span>
${navLinks}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.name}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
`;
}

function generateReadme(projectName) {
  return `# ${projectName}

Generated by AI App Builder.

## Getting Started

\`\`\`bash
npm install
cp .env.example .env
npm run dev
\`\`\`

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** JWT-based authentication

## Project Structure

\`\`\`
src/
├── components/    # React components
├── pages/         # Route pages
├── models/        # Data models
├── routes/        # API routes
├── lib/           # Shared utilities
├── middleware/    # Express middleware
└── server.js      # Backend entry point
\`\`\`
`;
}

function generateServerEntry(featureFiles) {
  const imports = ['import express from \'express\';', 'import cors from \'cors\';', 'import dotenv from \'dotenv\';', 'import { createServer } from \'http\';'];
  const setup = ['dotenv.config();', 'const app = express();', 'const server = createServer(app);', 'app.use(cors());', 'app.use(express.json());'];
  const mounts = [];

  if (featureFiles.some((f) => f.includes('storage') || f.includes('uploads'))) {
    imports.push("import express_static from 'express';");
    imports.push("import { getUploadDir } from './lib/storage.js';");
    mounts.push("app.use('/uploads', express.static(getUploadDir()));");
  }

  if (featureFiles.some((f) => f.includes('realtime'))) {
    imports.push("import { initRealtime } from './lib/realtime.js';");
    mounts.push('initRealtime(server);');
  }

  imports.push("import { mountRoutes } from './routes/index.js';");
  imports.push("import { initModels } from './models/index.js';");

  setup.push('initModels();');
  mounts.push('mountRoutes(app);');

  return `${imports.join('\n')}

${setup.join('\n')}

${mounts.join('\n')}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;
}
