# AI App Builder Platform

An AI-powered platform that generates complete full-stack web applications from natural language descriptions. Similar to Base44, but fully open-source and self-hosted.

## What It Does

Describe the app you want in plain English, and the AI generates:
- **React frontend** with Tailwind CSS and responsive UI components
- **Express backend** with RESTful API endpoints
- **Database schema** with auto-generated CRUD operations
- **User authentication** with JWT and role-based permissions
- **File storage** for uploads and media
- **Email integration** for notifications
- **Payment processing** via Stripe
- **Real-time updates** via WebSocket
- **Analytics tracking** with event system

## Tech Stack

### Platform (Builder)
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| AI | OpenAI GPT-4o-mini (with heuristic fallback) |
| Real-time | WebSocket |

### Generated Apps
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + bcrypt |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| Storage | Local filesystem / S3 |

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/joesellbot-alt/congenial-octo-rotary-phone.git
cd congenial-octo-rotary-phone

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev
```

The platform will be available at:
- **Builder UI:** http://localhost:3000
- **API Server:** http://localhost:4000

## Architecture

```
├── client/                 # Builder platform frontend
│   ├── src/
│   │   ├── components/    # UI components (chat, layout, etc.)
│   │   ├── pages/         # Platform pages (dashboard, builder, projects)
│   │   ├── hooks/         # State management (Zustand)
│   │   └── api/           # API client
│   └── ...
├── server/                 # Builder platform backend
│   ├── src/
│   │   ├── ai/           # AI orchestration & requirements analysis
│   │   ├── generator/    # Code generation engine
│   │   │   ├── entities.js    # Entity/model code generation
│   │   │   ├── pages.js       # React page generation
│   │   │   ├── api-routes.js  # REST API generation
│   │   │   ├── features.js    # Feature code (auth, payments, etc.)
│   │   │   ├── assembler.js   # Project assembly
│   │   │   └── deployer.js    # Deployment pipeline
│   │   ├── routes/        # Platform API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── utils/         # Database, WebSocket utilities
│   └── ...
└── templates/              # Code templates for generated apps
```

## Platform Capabilities

| Feature | Description |
|---------|-------------|
| Natural Language Input | Describe your app in plain English |
| Entity Detection | Auto-infers data models from description |
| Page Generation | Creates list/detail/dashboard pages |
| CRUD API | Auto-generates REST endpoints per entity |
| Authentication | JWT auth with login/register/roles |
| Payments | Stripe checkout & subscription support |
| Email | SMTP-based transactional email |
| File Storage | Upload/download with filesystem or S3 |
| Real-time | WebSocket for live updates |
| Analytics | Event tracking & reporting |
| Templates | Pre-built app templates (CRM, e-commerce, etc.) |
| Deployment | Export or deploy generated apps |

## How Code Generation Works

1. **User Input** → Natural language app description
2. **Analysis** → AI (or heuristic fallback) extracts entities, pages, features
3. **Entity Generation** → SQLite models with CRUD operations
4. **Page Generation** → React components with forms, lists, detail views
5. **API Generation** → Express routes for each entity
6. **Feature Integration** → Auth, payments, email, storage code
7. **Assembly** → Complete project with package.json, configs, README
8. **Output** → Runnable full-stack application

## Example Prompts

- "Build me a task management app with teams and deadlines"
- "Create an e-commerce store with product catalog and Stripe checkout"
- "Build a CRM with contact management and sales pipeline"
- "Create a booking system with calendar and email notifications"
- "Build a real-time chat app with channels and file sharing"

## License

MIT
