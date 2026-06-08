# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup

Requires a `.env` file in the project root with:
```
ANTHROPIC_API_KEY=<your key>
CLAUDE_MODEL=<model id, e.g. claude-sonnet-4-6>
```

Install dependencies and run:
```bash
uv venv
.venv\Scripts\activate   # Windows
uv pip install -e .
uv run main.py
```

Or without uv:
```bash
pip install anthropic python-dotenv prompt-toolkit "mcp[cli]==1.8.0"
python main.py
```

Pass additional MCP server scripts as CLI args (each is spawned as a subprocess):
```bash
uv run main.py my_other_server.py
```

Set `USE_UV=1` in `.env` to have the built-in doc server launched via `uv run` instead of `python`.

There are no tests and no linting configured.

## Architecture

The app is an interactive CLI that connects Claude (via the Anthropic API) to one or more MCP servers. The built-in doc server (`mcp_server.py`) is always spawned; additional servers can be added via CLI args.

### Data flow

```
User input (prompt_toolkit)
  → CliChat._process_query / _process_command
    → Chat.run (agentic loop: call Claude → execute tools → repeat until end_turn)
      → ToolManager dispatches tool calls to the appropriate MCPClient
```

### Key files

- **`main.py`** — entry point; reads `.env`; spawns MCP server subprocess(es) via `AsyncExitStack`; constructs and runs `CliApp`.
- **`mcp_server.py`** — FastMCP server exposing `read_doc_contents` and `edit_document` tools. Has TODOs for resources (doc IDs, doc content) and prompts (markdown rewrite, summarize).
- **`mcp_client.py`** — `MCPClient` wraps an MCP `ClientSession` over stdio. Has TODOs for `list_prompts`, `get_prompt`, and `read_resource` — these must be implemented for `@doc` mentions and `/command` completions to work.
- **`core/claude.py`** — thin wrapper around `anthropic.Anthropic`; handles message building and the `thinking` parameter.
- **`core/chat.py`** — base `Chat` class with the agentic loop: calls Claude, handles `tool_use` stop reason by dispatching to `ToolManager`, loops until `end_turn`.
- **`core/cli_chat.py`** — extends `Chat`; routes `@docId` mentions (fetches doc content via MCP resource) and `/command docId` slash commands (fetches prompt messages via MCP prompt) before calling the base loop.
- **`core/tools.py`** — `ToolManager`: aggregates tools from all clients, routes tool call requests to the correct client, returns `ToolResultBlockParam` lists.
- **`core/cli.py`** — `CliApp` wires `prompt_toolkit` with tab completion for `/commands` and `@resources`, key bindings that auto-open the completion menu on `/` and `@`, and in-memory history.

### MCP integration pattern

Each MCP server runs as a subprocess communicating over stdio. `MCPClient` is an async context manager that connects on enter and cleans up on exit. `main.py` uses `AsyncExitStack` so all clients are torn down together. `CliChat` holds a dedicated `doc_client` for the built-in server and a `clients` dict (shared with the base `Chat`) for tool dispatch.

### TODOs (incomplete features)

`mcp_client.py` stubs return empty lists for `list_prompts`, `get_prompt`, and `read_resource`. `mcp_server.py` has four TODO items for MCP resources and prompts. Until these are implemented, `@doc` injection and `/command` autocomplete are non-functional.
