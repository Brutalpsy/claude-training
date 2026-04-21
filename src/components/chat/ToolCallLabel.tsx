"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  state: string;
  result?: any;
}

interface ToolCallLabelProps {
  toolInvocation: ToolInvocation;
}

interface LabelPair {
  inProgress: string;
  completed: string;
}

function getFileName(path: string): string {
  const segments = path.split("/");
  return segments[segments.length - 1] || path;
}

function getLabel(toolInvocation: ToolInvocation): LabelPair {
  const { toolName, args } = toolInvocation;
  const parsedArgs = typeof args === "object" && args !== null ? args : {};
  const command = parsedArgs.command as string | undefined;
  const path = parsedArgs.path as string | undefined;
  const fileName = path ? getFileName(path) : "";

  if (toolName === "str_replace_editor" && path) {
    switch (command) {
      case "create":
        return { inProgress: `Creating ${fileName}`, completed: `Created ${fileName}` };
      case "str_replace":
        return { inProgress: `Editing ${fileName}`, completed: `Edited ${fileName}` };
      case "view":
        return { inProgress: `Viewing ${fileName}`, completed: `Viewed ${fileName}` };
      case "insert":
        return { inProgress: `Inserting into ${fileName}`, completed: `Inserted into ${fileName}` };
      case "undo_edit":
        return { inProgress: `Undoing edit in ${fileName}`, completed: `Undid edit in ${fileName}` };
    }
  }

  if (toolName === "file_manager" && path) {
    switch (command) {
      case "rename":
        return { inProgress: `Renaming ${fileName}`, completed: `Renamed ${fileName}` };
      case "delete":
        return { inProgress: `Deleting ${fileName}`, completed: `Deleted ${fileName}` };
    }
  }

  return { inProgress: `Running ${toolName}`, completed: `Ran ${toolName}` };
}

export function ToolCallLabel({ toolInvocation }: ToolCallLabelProps) {
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;
  const label = getLabel(toolInvocation);
  const parsedArgs = typeof toolInvocation.args === "object" && toolInvocation.args !== null ? toolInvocation.args : {};
  const fullPath = parsedArgs.path as string | undefined;

  return (
    <div
      className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200"
      title={fullPath || undefined}
    >
      {isCompleted ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">
        {isCompleted ? label.completed : label.inProgress}
      </span>
    </div>
  );
}

export { getLabel, getFileName };
export type { ToolInvocation, LabelPair };
