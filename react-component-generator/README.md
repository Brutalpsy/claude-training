# UIGen — React Component Generator

> Part of the [claude-training](../) monorepo.

AI-powered React component generator with live in-browser preview. Users describe components in a chat interface; Claude generates React+Tailwind code that renders in a sandboxed iframe. No files are written to disk — everything runs through an in-memory virtual file system.

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Optional** — add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=your-api-key-here
```

The app runs without an API key; a mock provider returns static code instead of calling Claude.

2. Install dependencies and initialize the database:

```bash
npm run setup
```

This command installs all dependencies, generates the Prisma client, and runs database migrations.

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Sign up or continue as an anonymous user
2. Describe the React component you want to create in the chat
3. View generated components in the live preview panel
4. Switch to Code view to see and edit the generated files
5. Keep iterating with the AI to refine your components

## Features

- AI-powered component generation using Claude
- Live preview with hot reload
- Virtual file system (no files written to disk)
- Syntax highlighting and Monaco code editor
- Component persistence for registered users
- Anonymous session support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 with App Router |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Language | TypeScript |
| Database | Prisma + SQLite |
| AI | Anthropic Claude via Vercel AI SDK |
| Testing | Vitest + React Testing Library |

## Available Scripts

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Start dev server (port 3000)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Run all tests
npm run db:reset       # Reset the SQLite database
```
