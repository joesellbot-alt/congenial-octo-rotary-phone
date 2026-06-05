import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckSquare,
  ShoppingCart,
  Users,
  BarChart3,
  Calendar,
  Kanban,
  MessageCircle,
  BookOpen,
} from 'lucide-react';

const templates = [
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Team task management with projects, deadlines, and assignments',
    icon: CheckSquare,
    features: ['auth', 'database', 'realtime'],
    prompt: 'Build me a task management app with teams, projects, tasks with deadlines and priority levels, and real-time updates',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Product catalog, shopping cart, and Stripe checkout',
    icon: ShoppingCart,
    features: ['auth', 'database', 'payments', 'storage'],
    prompt: 'Build me an e-commerce store with product catalog, categories, shopping cart, and Stripe checkout',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Contact management, deals pipeline, and activity tracking',
    icon: Users,
    features: ['auth', 'database', 'email'],
    prompt: 'Build me a CRM with contact management, deal pipeline stages, activity logging, and email integration',
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Data visualization with charts, metrics, and reports',
    icon: BarChart3,
    features: ['auth', 'database', 'analytics'],
    prompt: 'Build me an analytics dashboard with user metrics, charts, custom reports, and data export',
  },
  {
    id: 'booking-system',
    name: 'Booking System',
    description: 'Appointment scheduling with calendar and notifications',
    icon: Calendar,
    features: ['auth', 'database', 'email', 'realtime'],
    prompt: 'Build me a booking/scheduling system with calendar view, appointment management, and email notifications',
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Kanban boards, sprints, and team collaboration',
    icon: Kanban,
    features: ['auth', 'database', 'realtime', 'storage'],
    prompt: 'Build me a project management tool with kanban boards, sprints, file attachments, and team collaboration',
  },
  {
    id: 'chat-app',
    name: 'Chat Application',
    description: 'Real-time messaging with channels and direct messages',
    icon: MessageCircle,
    features: ['auth', 'database', 'realtime', 'storage'],
    prompt: 'Build me a real-time chat application with channels, direct messages, file sharing, and online status',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Documentation wiki with categories and search',
    icon: BookOpen,
    features: ['auth', 'database', 'storage'],
    prompt: 'Build me a knowledge base / wiki with categories, rich text articles, search, and user permissions',
  },
];

export default function Templates() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Start from a template or use it as inspiration for your app
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <template.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{template.name}</h3>
            </div>
            <p className="mb-3 flex-1 text-sm text-muted-foreground">{template.description}</p>
            <div className="mb-3 flex flex-wrap gap-1">
              {template.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
            <Link to={`/build?template=${template.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
