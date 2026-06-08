"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useChat as useAIChat } from "@ai-sdk/react";
import { UIMessage, DefaultChatTransport } from "ai";
import { useFileSystem } from "./file-system-context";
import { setHasAnonWork } from "@/lib/anon-work-tracker";

interface ChatContextProps {
  projectId?: string;
  initialMessages?: UIMessage[];
}

interface ChatContextType {
  messages: UIMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  projectId,
  initialMessages = [],
}: ChatContextProps & { children: ReactNode }) {
  const { fileSystem, handleToolCall } = useFileSystem();
  const processedToolCalls = useRef(new Set<string>());
  const [input, setInput] = useState("");

  const fileSystemRef = useRef(fileSystem);
  fileSystemRef.current = fileSystem;

  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          files: fileSystemRef.current.serialize(),
          projectId: projectIdRef.current,
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useAIChat({
    transport,
    messages: initialMessages,
    onToolCall: ({ toolCall }: { toolCall: any }) => {
      handleToolCall(toolCall);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Sync server-executed tool calls into the client VFS.
  // AI SDK v5: tool parts use type "tool-{toolName}" with state "output-available" and input/output fields.
  useEffect(() => {
    for (const message of messages) {
      if (!message.parts) continue;
      for (const part of message.parts as any[]) {
        if (
          part.type?.startsWith("tool-") &&
          part.state === "output-available" &&
          !processedToolCalls.current.has(part.toolCallId)
        ) {
          processedToolCalls.current.add(part.toolCallId);
          handleToolCall({
            toolName: part.type.slice("tool-".length),
            args: part.input,
          });
        }
      }
    }
  }, [messages, handleToolCall]);

  // Track anonymous work
  useEffect(() => {
    if (!projectId && messages.length > 0) {
      setHasAnonWork(messages, fileSystem.serialize());
    }
  }, [messages, fileSystem, projectId]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        handleInputChange,
        handleSubmit,
        status,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
