import { anthropic } from "@ai-sdk/anthropic";

const MODEL = "claude-haiku-4-5";

function extractUserPrompt(messages: any[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") {
      const c = m.content;
      if (Array.isArray(c)) {
        return c.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ");
      }
      if (typeof c === "string") return c;
    }
  }
  return "";
}

function countToolMessages(messages: any[]): number {
  return messages.filter((m) => m.role === "tool").length;
}

function pickComponent(userPrompt: string): { type: string; name: string } {
  const p = userPrompt.toLowerCase();
  if (p.includes("form")) return { type: "form", name: "ContactForm" };
  if (p.includes("card")) return { type: "card", name: "Card" };
  return { type: "counter", name: "Counter" };
}

function getComponentCode(componentType: string): string {
  switch (componentType) {
    // direction: warm minimal — bg-[#faf6f1], stone palette, terracotta accent
    case "form":
      return `import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); console.log('Form submitted:', formData); };

  return (
    <div className="max-w-lg w-full">
      <p className="text-xs tracking-widest uppercase text-stone-400 mb-3 font-mono">// get in touch</p>
      <h2 className="text-4xl font-black tracking-tight text-stone-900 mb-8 leading-none">
        Let's talk<span className="text-[#c2410c]">.</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-4">
          <input name="name" value={formData.name} onChange={handleChange} required placeholder="Your name"
            className="flex-1 px-4 py-3 bg-transparent border-b-2 border-stone-300 focus:border-[#c2410c] outline-none text-stone-900 placeholder:text-stone-400 transition-colors" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email"
            className="flex-1 px-4 py-3 bg-transparent border-b-2 border-stone-300 focus:border-[#c2410c] outline-none text-stone-900 placeholder:text-stone-400 transition-colors" />
        </div>
        <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="What's on your mind?"
          className="w-full px-4 py-3 bg-stone-100/60 border border-stone-200 rounded-none focus:border-[#c2410c] outline-none text-stone-900 placeholder:text-stone-400 transition-colors resize-none" />
        <button type="submit"
          className="group flex items-center gap-3 bg-[#c2410c] text-[#faf6f1] px-7 py-3 rounded-full font-semibold tracking-tight hover:bg-stone-900 transition-colors duration-200">
          Send message
          <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>
      </form>
    </div>
  );
};

export default ContactForm;`;

    // direction: dark editorial — bg-[#0c0c0c], off-white text, lime accent
    case "card":
      return `import React from 'react';

const Card = ({ title = "Amazing Product", description = "A bold idea executed with precision. Built for people who don't settle.", actions }) => {
  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-tl-3xl rounded-br-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-sm">
      <div className="h-1 w-full bg-gradient-to-r from-lime-400 via-emerald-400 to-transparent" />
      <div className="p-8">
        <p className="text-[10px] tracking-widest uppercase text-lime-400 font-mono mb-6">// featured</p>
        <h3 className="text-2xl font-black tracking-tight text-neutral-50 leading-tight mb-3">{title}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed mb-8">{description}</p>
        {actions ? actions : (
          <button className="text-xs tracking-widest uppercase font-bold text-[#0c0c0c] bg-lime-400 px-5 py-2.5 rounded-full hover:bg-lime-300 transition-colors duration-150">
            Explore →
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;`;

    // direction: high contrast duochrome — bg-slate-900 + amber accent
    default:
      return `import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  const isNegative = count < 0;
  return (
    <div className="w-full max-w-xs">
      <p className="text-[10px] tracking-widest uppercase text-slate-500 font-mono mb-4">// counter</p>
      <div className="relative mb-8">
        <div className={
          "text-[96px] font-black leading-none tracking-tighter transition-colors duration-200 " +
          (isNegative ? "text-slate-500" : "text-amber-400")
        }>
          {count}
        </div>
        <div className="absolute -bottom-2 left-0 h-px w-16 bg-amber-400/40" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => setCount(count - 1)}
          className="flex-1 py-3 border border-slate-700 text-slate-400 text-sm font-mono tracking-widest hover:border-slate-500 hover:text-slate-200 transition-colors duration-150 rounded-full">
          −
        </button>
        <button onClick={() => setCount(0)}
          className="px-5 py-3 border border-slate-700 text-slate-500 text-xs font-mono tracking-widest hover:border-slate-500 transition-colors duration-150 rounded-full">
          RST
        </button>
        <button onClick={() => setCount(count + 1)}
          className="flex-1 py-3 bg-amber-400 text-slate-900 text-sm font-mono font-bold tracking-widest hover:bg-amber-300 transition-colors duration-150 rounded-full">
          +
        </button>
      </div>
    </div>
  );
};

export default Counter;`;
  }
}

function getAppCode(componentName: string): string {
  if (componentName === "Card") {
    return `import Card from '@/components/Card';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-12">
      <Card />
    </div>
  );
}`;
  }
  if (componentName === "ContactForm") {
    return `import ContactForm from '@/components/ContactForm';

export default function App() {
  return (
    <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center p-12">
      <ContactForm />
    </div>
  );
}`;
  }
  return `import ${componentName} from '@/components/${componentName}';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-12">
      <${componentName} />
    </div>
  );
}`;
}

function buildStreamParts(messages: any[]): any[] {
  const userPrompt = extractUserPrompt(messages);
  const { type: componentType, name: componentName } = pickComponent(userPrompt);
  const toolMessageCount = countToolMessages(messages);

  const parts: any[] = [{ type: "stream-start", warnings: [] }];

  const emitText = (id: string, text: string) => {
    parts.push({ type: "text-start", id });
    parts.push({ type: "text-delta", id, delta: text });
    parts.push({ type: "text-end", id });
  };

  if (toolMessageCount === 0) {
    emitText("t1", "Creating your component. App.jsx entry file first.");
    parts.push({
      type: "tool-call",
      toolCallId: "call_app",
      toolName: "str_replace_editor",
      input: JSON.stringify({
        command: "create",
        path: "/App.jsx",
        file_text: getAppCode(componentName),
      }),
    });
  } else if (toolMessageCount === 1) {
    emitText("t1", `Now creating the ${componentName} component.`);
    parts.push({
      type: "tool-call",
      toolCallId: "call_component",
      toolName: "str_replace_editor",
      input: JSON.stringify({
        command: "create",
        path: `/components/${componentName}.jsx`,
        file_text: getComponentCode(componentType),
      }),
    });
  } else {
    emitText("t1", "Done. Preview is live on the right.");
  }

  parts.push({
    type: "finish",
    finishReason: toolMessageCount >= 2 ? "stop" : "tool-calls",
    usage: { inputTokens: 50, outputTokens: 50 },
  });

  return parts;
}

class MockLanguageModelV2 {
  readonly specificationVersion = "v2" as const;
  readonly provider = "mock";
  readonly modelId = "mock-claude-haiku-4-5";
  readonly supportedUrls: Record<string, RegExp[]> = {};

  async doStream(options: { prompt: any[] }) {
    const parts = buildStreamParts(options.prompt);
    const stream = new ReadableStream({
      start(controller) {
        for (const part of parts) controller.enqueue(part);
        controller.close();
      },
    });
    return { stream };
  }

  async doGenerate(options: { prompt: any[] }) {
    const parts = buildStreamParts(options.prompt);
    const content: any[] = [];
    for (const p of parts) {
      if (p.type === "text-delta") content.push({ type: "text", text: p.delta });
      if (p.type === "tool-call") content.push({ type: "tool-call", toolCallId: p.toolCallId, toolName: p.toolName, input: p.input });
    }
    const finish = parts.find((p) => p.type === "finish");
    return {
      content,
      finishReason: finish?.finishReason ?? "stop",
      usage: finish?.usage ?? { inputTokens: 0, outputTokens: 0 },
    };
  }
}

export function getLanguageModel(): any {
  if (process.env.USE_MOCK_PROVIDER === "true") {
    console.log("USE_MOCK_PROVIDER=true, using mock provider");
    return new MockLanguageModelV2();
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.log("No ANTHROPIC_API_KEY found, using mock provider");
    return new MockLanguageModelV2();
  }

  return anthropic(MODEL);
}
