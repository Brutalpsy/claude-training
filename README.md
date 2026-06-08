# Claude Training

A monorepo containing two projects built around the [Anthropic Claude](https://www.anthropic.com) API.

## Projects

### [react-component-generator](./react-component-generator)

AI-powered React component generator with live in-browser preview. Describe a component in plain English and watch it render in real time — no files written to disk.

- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Prisma/SQLite, Vercel AI SDK
- **Runs on:** Node.js 18+

```bash
cd react-component-generator
npm run setup
npm run dev        # http://localhost:3000
```

### [mcp](./mcp)

Interactive CLI chat client that connects Claude to one or more MCP (Model Context Protocol) servers. Supports document retrieval, slash command prompts with tab completion, and extensible tool integrations.

- **Stack:** Python 3.9+, Anthropic SDK, prompt-toolkit, FastMCP, uv
- **Requires:** `ANTHROPIC_API_KEY` in `mcp/.env`

```bash
cd mcp
uv venv && .venv\Scripts\activate
uv pip install -e .
uv run main.py
```

## Repository Layout

```
.claude/                     # Claude Code skills and settings (repo-wide)
.github/                     # GitHub Actions workflows
react-component-generator/   # Next.js UIGen app
mcp/                         # Python MCP CLI
```
