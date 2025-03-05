# AI Gateway Portal

A Next.js application for managing LiteLLM teams and configurations.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000  # Your LiteLLM API base URL
LITELLM_API_KEY=your-api-key-here              # Your LiteLLM API key
```

### Running with Docker

1. Build and start the application:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- Team Management
  - Create and manage teams
  - Add/remove team members
  - Configure team models and budgets
  - Set team permissions and roles

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/             # Utilities and configurations
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
└── package.json       # Project dependencies and scripts
