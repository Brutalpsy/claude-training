# Claude Training

A single repository containing two independent projects built around the [Anthropic Claude](https://www.anthropic.com) API.

## Projects

### [react-component-generator](./react-component-generator/README.md) — UIGen

AI-powered React component generator with live in-browser preview. Describe a component in plain English and watch it render in real time — no files written to disk.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Prisma/SQLite · Vercel AI SDK

### [mcp](./mcp/README.md) — MCP Chat

Interactive CLI chat client that connects Claude to one or more MCP (Model Context Protocol) servers. Supports document retrieval via `@docId` mentions and slash command prompts with tab completion.

**Stack:** Python 3.9+ · Anthropic SDK · prompt-toolkit · FastMCP · uv

## Repository Layout

```
.claude/                     # Claude Code skills and settings (repo-wide)
.github/                     # GitHub Actions workflows
react-component-generator/   # Next.js UIGen app
mcp/                         # Python MCP CLI
```
