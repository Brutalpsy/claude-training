# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Repository Overview

This repository contains two independent projects built around the Claude AI API.

```
react-component-generator/   # Next.js app — AI-powered React component generator
mcp/                         # Python CLI — interactive chat client with MCP server integration
```

Each project has its own `CLAUDE.md` with detailed guidance. Always read the relevant project's `CLAUDE.md` before working on it.

---

## react-component-generator

AI-powered React component generator with live in-browser preview. Users describe components in a chat interface; Claude generates React+Tailwind code that renders in a sandboxed iframe via an in-memory virtual file system.

**Tech stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Prisma/SQLite, Vercel AI SDK, Anthropic Claude

**Key commands** (run from `react-component-generator/`):
```bash
npm run setup    # Install deps, generate Prisma client, run migrations
npm run dev      # Start dev server on port 3000
npm run test     # Vitest test suite
npm run build    # Production build
```

See [`react-component-generator/CLAUDE.md`](react-component-generator/CLAUDE.md) for architecture, request flow, and data model details.

---

## mcp

Interactive CLI chat application that connects Claude to one or more MCP (Model Context Protocol) servers. Supports document retrieval via `@docId` mentions, slash command prompts with tab completion, and an extensible tool architecture.

**Tech stack:** Python 3.9+, Anthropic SDK, prompt-toolkit, FastMCP, uv

**Key commands** (run from `mcp/`):
```bash
uv venv && .venv\Scripts\activate
uv pip install -e .
uv run main.py              # Start CLI chat
uv run main.py my_server.py # Start with additional MCP servers
```

Requires a `.env` file with `ANTHROPIC_API_KEY` and `CLAUDE_MODEL`.

See [`mcp/CLAUDE.md`](mcp/CLAUDE.md) for architecture, data flow, and TODO items.

---

## Development Best Practices

- Use comments sparingly. Only comment complex or non-obvious code.
- Follow SOLID principles.
- Use the Serena MCP server for code analysis.
