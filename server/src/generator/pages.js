export function generatePages(pageDefs, _entityFiles) {
  const files = {};

  for (const page of pageDefs) {
    const fileName = `src/pages/${page.name}.jsx`;

    if (page.route === '/') {
      files[fileName] = generateDashboardPage(page, pageDefs);
    } else if (page.route.includes(':id')) {
      files[fileName] = generateDetailPage(page);
    } else {
      files[fileName] = generateListPage(page);
    }
  }

  files['src/App.jsx'] = generateAppRouter(pageDefs);

  return files;
}

function generateDashboardPage(page, allPages) {
  const entityPages = allPages.filter((p) => !p.route.includes(':id') && p.route !== '/');

  return `import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ${page.name}() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">${page.name}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
${entityPages
  .map(
    (p) => `        <Link to="${p.route}" className="block p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg">${p.name.replace('List', '')}</h3>
          <p className="text-gray-500 text-sm mt-1">${p.description}</p>
          <p className="text-primary font-medium mt-2">{stats.${p.entities[0]?.toLowerCase() || 'items'} || 0} total</p>
        </Link>`
  )
  .join('\n')}
      </div>
    </div>
  );
}
`;
}

function generateListPage(page) {
  const entityName = page.entities[0] || 'Item';
  const entityLower = entityName.toLowerCase();
  const plural = entityLower + 's';

  return `import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ${page.name}() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.get('/entities/${plural}');
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await api.post('/entities/${plural}', formData);
      setShowForm(false);
      loadItems();
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(\`/entities/${plural}/\${id}\`);
      loadItems();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${entityName}s</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {showForm ? 'Cancel' : 'Add ${entityName}'}
        </button>
      </div>

      {showForm && (
        <CreateForm onSubmit={handleCreate} entityName="${entityName}" />
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white rounded-lg border flex justify-between items-center">
            <Link to={\`${page.route.replace('s', 's/')}\${item.id}\`} className="flex-1">
              <p className="font-medium">{item.name || item.title || item.id}</p>
              <p className="text-sm text-gray-500">{item.status || item.description || ''}</p>
            </Link>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm">
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-gray-500 py-8">No ${plural} yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}

function CreateForm({ onSubmit, entityName }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="font-medium mb-3">New {entityName}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          placeholder="Name/Title"
          className="px-3 py-2 border rounded-md"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          placeholder="Description"
          className="px-3 py-2 border rounded-md"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <button type="submit" className="mt-3 px-4 py-2 bg-primary text-white rounded-md">
        Create
      </button>
    </form>
  );
}
`;
}

function generateDetailPage(page) {
  const entityName = page.entities[0] || 'Item';
  const entityLower = entityName.toLowerCase();
  const plural = entityLower + 's';

  return `import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ${page.name}() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    api.get(\`/entities/${plural}/\${id}\`).then((data) => {
      setItem(data);
      setFormData(data);
    }).catch(() => navigate('/${plural}'));
  }, [id, navigate]);

  const handleUpdate = async () => {
    try {
      await api.put(\`/entities/${plural}/\${id}\`, formData);
      setItem(formData);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  if (!item) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => navigate('/${plural}')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        &larr; Back to ${entityName}s
      </button>
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{item.name || item.title || '${entityName} Details'}</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editing ? (
          <div className="space-y-3">
            {Object.entries(formData).filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key)).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                <input
                  value={value || ''}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
            <button onClick={handleUpdate} className="px-4 py-2 bg-primary text-white rounded-md">
              Save Changes
            </button>
          </div>
        ) : (
          <dl className="space-y-3">
            {Object.entries(item).filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key)).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-gray-500 capitalize">{key}</dt>
                <dd className="mt-1">{String(value || '-')}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
`;
}

function generateAppRouter(pageDefs) {
  const imports = pageDefs
    .map((p) => `import ${p.name} from './pages/${p.name}';`)
    .join('\n');

  const routes = pageDefs
    .map((p) => {
      if (p.route === '/') {
        return `          <Route index element={<${p.name} />} />`;
      }
      return `          <Route path="${p.route.slice(1)}" element={<${p.name} />} />`;
    })
    .join('\n');

  return `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
${imports}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
${routes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
`;
}
