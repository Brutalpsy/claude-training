# CLAUDE.md

This repository is a monorepo containing multiple independent projects.

## Projects

### react-component-generator/
AI-powered React component generator with live in-browser preview. Users describe components in a chat interface, and an AI (Claude via Vercel AI SDK) generates React+Tailwind code rendered in a sandboxed iframe.

See `react-component-generator/CLAUDE.md` for detailed guidance on that project.

### mcp/
MCP CLI project (in progress).

## Repository Layout

```
.claude/          # Claude Code skills and settings (repo-wide)
.github/          # GitHub Actions workflows
react-component-generator/  # Next.js UIGen app
mcp/              # MCP CLI project
```
