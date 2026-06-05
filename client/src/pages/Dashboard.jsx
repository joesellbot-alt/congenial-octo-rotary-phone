import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  FolderOpen,
  Zap,
  Database,
  Shield,
  CreditCard,
  Mail,
  Globe,
} from 'lucide-react';

const capabilities = [
  { icon: Database, label: 'Database & CRUD APIs', desc: 'Auto-generated from entity schemas' },
  { icon: Shield, label: 'Authentication', desc: 'JWT auth with roles & permissions' },
  { icon: CreditCard, label: 'Payments', desc: 'Stripe checkout & subscriptions' },
  { icon: Mail, label: 'Email', desc: 'Transactional & marketing emails' },
  { icon: Globe, label: 'Real-time', desc: 'WebSocket live updates' },
  { icon: Zap, label: 'Backend Functions', desc: 'Serverless API endpoints' },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI App Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Build full-stack web applications from natural language descriptions
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Build a New App
            </CardTitle>
            <CardDescription>
              Describe what you want to build and the AI will generate a complete full-stack
              application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/build">
              <Button>Start Building</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5" />
              Your Projects
            </CardTitle>
            <CardDescription>View and manage your generated applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects">
              <Button variant="outline">View Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Platform Capabilities</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="p-4">
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
