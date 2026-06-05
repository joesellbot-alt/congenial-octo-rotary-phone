# App Builder Templates

This directory contains the code templates used by the AI code generation engine to produce full-stack applications.

## Structure

```
templates/
├── base/               # Base project scaffold (package.json, configs)
├── components/         # Reusable UI component templates
├── features/           # Feature-specific code generators
│   ├── auth/          # Authentication (JWT, roles, login/register)
│   ├── database/      # Database setup (SQLite/PostgreSQL, migrations)
│   ├── storage/       # File upload & storage
│   ├── email/         # Email sending (SMTP, templates)
│   ├── payments/      # Stripe integration (checkout, subscriptions)
│   ├── realtime/      # WebSocket real-time updates
│   └── analytics/     # Event tracking & analytics dashboard
└── pages/             # Page templates (list, detail, dashboard, forms)
```

## How Templates Work

1. User describes an app in natural language
2. The AI analyzer extracts entities, pages, and features
3. The generator assembles the app from these templates
4. Generated code is a complete, runnable React + Express application

## Adding New Templates

Each template file uses `{{variable}}` syntax for interpolation. The generator fills these in based on the analyzed requirements.

## Supported App Types

- Task Management / Project Management
- E-Commerce / Online Stores
- CRM / Contact Management
- SaaS Dashboards
- Booking / Scheduling
- Chat / Messaging
- Knowledge Base / Wiki
- Any custom full-stack app
