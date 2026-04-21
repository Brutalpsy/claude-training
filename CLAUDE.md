# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live in-browser preview. Users describe components in a chat interface, and an AI (Claude via Vercel AI SDK) generates React+Tailwind code that renders in a sandboxed iframe. No files are written to disk — everything runs through an in-memory virtual file system.

## Commands

```bash
npm run setup          # Install deps, generate Prisma client, run migrations
npm run dev            # Start dev server (Next.js + Turbopack, port 3000)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Vitest (all tests)
npx vitest run src/path/to/file.test.ts  # Single test file
npm run db:reset       # Reset SQLite database
npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma migrate dev # Create/apply new migration
```

The dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` (already in the npm scripts) to patch Node 25+ SSR Web Storage globals.

## Architecture

### Request Flow

1. User sends a message via the chat panel (left side of split layout)
2. `ChatProvider` (`src/lib/contexts/chat-context.tsx`) uses Vercel AI SDK's `useChat` to POST to `/api/chat`
3. The API route (`src/app/api/chat/route.ts`) reconstructs a `VirtualFileSystem` from the serialized file state sent with the request, attaches `str_replace_editor` and `file_manager` tools, and calls `streamText`
4. The AI uses tools to create/edit/delete files in the VFS; tool results stream back to the client
5. `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) intercepts tool calls client-side to mirror changes in the browser's VFS instance
6. `PreviewFrame` watches for VFS changes, transforms JSX via `@babel/standalone`, builds an import map with blob URLs, and renders the result in a sandboxed iframe

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`): In-memory file tree with serialize/deserialize. Used both server-side (in the API route, per-request) and client-side (in React context). Supports the text-editor commands (view, create, str_replace, insert).
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Babel-based transform that builds import maps. Local files become blob URLs; third-party packages resolve via `esm.sh`. CSS imports are extracted into a `<style>` block.
- **MockLanguageModel** (`src/lib/provider.ts`): When `ANTHROPIC_API_KEY` is unset, a mock provider returns canned multi-step tool calls so the app is functional without API access.
- **AI Tools**: `str_replace_editor` (view/create/str_replace/insert) and `file_manager` (rename/delete) — defined in `src/lib/tools/`.

### Data Model

SQLite via Prisma. Two models: `User` and `Project`. Projects store `messages` and virtual FS `data` as JSON strings. Anonymous users get an ephemeral session stored in `sessionStorage` (`src/lib/anon-work-tracker.ts`); authenticated users get JWT sessions in httpOnly cookies. The database schema is defined in `prisma/schema.prisma` — reference it anytime you need to understand the structure of data stored in the database.

Prisma client is generated to `src/generated/prisma/` (gitignored — must run `npx prisma generate` after clone).

### Routing

- `/` — anonymous landing or redirect to most recent project for authenticated users
- `/[projectId]` — project page (requires auth, renders `MainContent`)
- `/api/chat` — streaming chat endpoint

### UI Structure

`MainContent` (`src/app/main-content.tsx`) is the main client component: resizable left (chat) and right (preview/code) panels. The right panel toggles between a live preview iframe and a Monaco code editor with file tree. UI components use shadcn/ui (new-york style) with Radix primitives.

### Auth

JWT-based via `jose`. Server actions in `src/actions/index.ts` handle signUp/signIn/signOut. Middleware protects `/api/projects` and `/api/filesystem` routes.

## Testing

Vitest with jsdom environment and React Testing Library. Tests live in `__tests__` directories alongside their source files. Path aliases (`@/*`) are resolved via `vite-tsconfig-paths`. Config is in `vitest.config.mts`.

For server-side tests that need real Node APIs (e.g. `jose` crypto), add `// @vitest-environment node` at the top of the test file to override the default jsdom environment.

## Tech Specifics

- Path alias: `@/*` maps to `./src/*`
- Tailwind CSS v4 (PostCSS plugin, not tailwind.config.js)
- The generation prompt (`src/lib/prompts/generation.tsx`) instructs the AI to use `/App.jsx` as the entry point and `@/` import aliases within the virtual FS
- The preview iframe loads Tailwind via CDN (`cdn.tailwindcss.com`) and React 19 via `esm.sh`

# Development Best Practices

- Use comments sparingly. Only comment complex or non-obvious code.
- Follow SOLID principles.
- Use the Serena MCP server for code analysis.
