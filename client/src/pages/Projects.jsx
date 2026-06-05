import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '@/hooks/useStore';
import { api } from '@/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, ExternalLink, Clock, Layers } from 'lucide-react';

export default function Projects() {
  const { projects, isLoading, setProjects, setLoading } = useProjectStore();

  useEffect(() => {
    setLoading(true);
    api
      .get('/projects')
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [setProjects, setLoading]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Your generated applications</p>
        </div>
        <Link to="/build">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex h-40 flex-col items-center justify-center p-6">
          <Layers className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No projects yet</p>
          <Link to="/build" className="mt-2">
            <Button variant="outline" size="sm">
              Build your first app
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <h3 className="font-semibold">{project.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {project.entities?.length || 0} entities
                  </span>
                  {project.deployed && (
                    <span className="flex items-center gap-1 text-green-600">
                      <ExternalLink className="h-3 w-3" />
                      Live
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
