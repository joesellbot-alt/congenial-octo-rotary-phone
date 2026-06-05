import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  MessageSquare,
  Download,
  ExternalLink,
  Database,
  FileCode,
  Layout,
} from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/projects/${projectId}`)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
        <Link to="/projects" className="mt-2">
          <Button variant="outline" size="sm">
            Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/projects" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/build/${projectId}`}>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Edit with AI
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {project.deployed && (
              <Button size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open App
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.entities?.length > 0 ? (
              <ul className="space-y-2">
                {project.entities.map((entity) => (
                  <li key={entity.name} className="rounded border p-2 text-sm">
                    <span className="font-medium">{entity.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {entity.fields?.length || 0} fields
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No entities defined</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layout className="h-4 w-4" />
              Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.pages?.length > 0 ? (
              <ul className="space-y-2">
                {project.pages.map((page) => (
                  <li key={page.name} className="rounded border p-2 text-sm">
                    <span className="font-medium">{page.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{page.route}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No pages defined</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode className="h-4 w-4" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(project.features || ['auth', 'database']).map((feature) => (
                <li key={feature} className="rounded border p-2 text-sm capitalize">
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
