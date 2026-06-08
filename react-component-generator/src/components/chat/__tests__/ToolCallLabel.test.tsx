import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallLabel, getLabel, getFileName } from "../ToolCallLabel";
import type { ToolInvocation } from "../ToolCallLabel";

afterEach(() => {
  cleanup();
});

function makeToolInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    toolCallId: "call_1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "Success",
    ...overrides,
  };
}

// --- getFileName unit tests ---

test("getFileName extracts filename from path", () => {
  expect(getFileName("/components/Counter.jsx")).toBe("Counter.jsx");
});

test("getFileName handles root-level files", () => {
  expect(getFileName("/App.jsx")).toBe("App.jsx");
});

test("getFileName handles deeply nested paths", () => {
  expect(getFileName("/a/b/c/d/file.ts")).toBe("file.ts");
});

test("getFileName returns the input when no slashes", () => {
  expect(getFileName("file.txt")).toBe("file.txt");
});

// --- getLabel unit tests ---

test("getLabel returns create labels for str_replace_editor create command", () => {
  const label = getLabel(makeToolInvocation({ args: { command: "create", path: "/App.jsx" } }));
  expect(label.inProgress).toBe("Creating App.jsx");
  expect(label.completed).toBe("Created App.jsx");
});

test("getLabel returns edit labels for str_replace_editor str_replace command", () => {
  const label = getLabel(makeToolInvocation({ args: { command: "str_replace", path: "/components/Counter.jsx" } }));
  expect(label.inProgress).toBe("Editing Counter.jsx");
  expect(label.completed).toBe("Edited Counter.jsx");
});

test("getLabel returns view labels for str_replace_editor view command", () => {
  const label = getLabel(makeToolInvocation({ args: { command: "view", path: "/index.ts" } }));
  expect(label.inProgress).toBe("Viewing index.ts");
  expect(label.completed).toBe("Viewed index.ts");
});

test("getLabel returns insert labels for str_replace_editor insert command", () => {
  const label = getLabel(makeToolInvocation({ args: { command: "insert", path: "/utils.ts" } }));
  expect(label.inProgress).toBe("Inserting into utils.ts");
  expect(label.completed).toBe("Inserted into utils.ts");
});

test("getLabel returns undo labels for str_replace_editor undo_edit command", () => {
  const label = getLabel(makeToolInvocation({ args: { command: "undo_edit", path: "/App.jsx" } }));
  expect(label.inProgress).toBe("Undoing edit in App.jsx");
  expect(label.completed).toBe("Undid edit in App.jsx");
});

test("getLabel returns rename labels for file_manager rename command", () => {
  const label = getLabel(makeToolInvocation({ toolName: "file_manager", args: { command: "rename", path: "/old.jsx" } }));
  expect(label.inProgress).toBe("Renaming old.jsx");
  expect(label.completed).toBe("Renamed old.jsx");
});

test("getLabel returns delete labels for file_manager delete command", () => {
  const label = getLabel(makeToolInvocation({ toolName: "file_manager", args: { command: "delete", path: "/trash.jsx" } }));
  expect(label.inProgress).toBe("Deleting trash.jsx");
  expect(label.completed).toBe("Deleted trash.jsx");
});

test("getLabel falls back to tool name for unknown tools", () => {
  const label = getLabel(makeToolInvocation({ toolName: "unknown_tool", args: {} }));
  expect(label.inProgress).toBe("Running unknown_tool");
  expect(label.completed).toBe("Ran unknown_tool");
});

test("getLabel falls back when str_replace_editor has no path", () => {
  const label = getLabel(makeToolInvocation({ args: { command: "create" } }));
  expect(label.inProgress).toBe("Running str_replace_editor");
  expect(label.completed).toBe("Ran str_replace_editor");
});

test("getLabel handles args being a string (partial streaming)", () => {
  const label = getLabel(makeToolInvocation({ args: '{"command":"cre' as any }));
  expect(label.inProgress).toBe("Running str_replace_editor");
  expect(label.completed).toBe("Ran str_replace_editor");
});

test("getLabel handles args being null", () => {
  const label = getLabel(makeToolInvocation({ args: null as any }));
  expect(label.inProgress).toBe("Running str_replace_editor");
  expect(label.completed).toBe("Ran str_replace_editor");
});

// --- ToolCallLabel component rendering tests ---

test("renders completed state with green dot and past-tense label", () => {
  render(<ToolCallLabel toolInvocation={makeToolInvocation()} />);

  expect(screen.getByText("Created App.jsx")).toBeDefined();
  const container = screen.getByText("Created App.jsx").closest("div[class*='inline-flex']");
  expect(container?.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container?.querySelector(".animate-spin")).toBeNull();
});

test("renders in-progress state with spinner and present-tense label", () => {
  render(<ToolCallLabel toolInvocation={makeToolInvocation({ state: "call", result: undefined })} />);

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const container = screen.getByText("Creating App.jsx").closest("div[class*='inline-flex']");
  expect(container?.querySelector(".animate-spin")).toBeDefined();
  expect(container?.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders partial-call state as in-progress", () => {
  render(<ToolCallLabel toolInvocation={makeToolInvocation({ state: "partial-call", result: undefined, args: '{"comma' as any })} />);

  expect(screen.getByText("Running str_replace_editor")).toBeDefined();
  const container = screen.getByText("Running str_replace_editor").closest("div[class*='inline-flex']");
  expect(container?.querySelector(".animate-spin")).toBeDefined();
});

test("shows full path in title attribute", () => {
  const { container } = render(
    <ToolCallLabel toolInvocation={makeToolInvocation({ args: { command: "create", path: "/components/ui/Button.jsx" } })} />
  );

  const pill = container.querySelector("div[title]");
  expect(pill?.getAttribute("title")).toBe("/components/ui/Button.jsx");
});

test("omits title when no path in args", () => {
  const { container } = render(
    <ToolCallLabel toolInvocation={makeToolInvocation({ toolName: "unknown_tool", args: {} })} />
  );

  const pill = container.querySelector("div[class*='inline-flex']");
  expect(pill?.getAttribute("title")).toBeNull();
});

test("renders file_manager delete as completed", () => {
  render(
    <ToolCallLabel
      toolInvocation={makeToolInvocation({
        toolName: "file_manager",
        args: { command: "delete", path: "/old-file.jsx" },
      })}
    />
  );

  expect(screen.getByText("Deleted old-file.jsx")).toBeDefined();
});

test("renders str_replace_editor edit as in-progress", () => {
  render(
    <ToolCallLabel
      toolInvocation={makeToolInvocation({
        args: { command: "str_replace", path: "/components/Counter.jsx" },
        state: "call",
        result: undefined,
      })}
    />
  );

  expect(screen.getByText("Editing Counter.jsx")).toBeDefined();
});
