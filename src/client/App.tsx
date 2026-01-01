import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import { Streamdown } from "streamdown";

interface ConfigInfo {
  provider: string;
  model: string;
  baseURL: string;
}

// Function to extract thinking content, tool calls, and regular content separately
function parseContent(content: string): {
  thinking: string[];
  toolCalls: Array<{ name: string; args: string }>;
  regular: string;
  hasIncompleteTags: boolean;
} {
  const thinkingBlocks: string[] = [];
  const toolCalls: Array<{ name: string; args: string }> = [];

  // Extract complete <think>...</think> pairs
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  while ((match = thinkRegex.exec(content)) !== null) {
    thinkingBlocks.push(match[1].trim());
  }

  // Extract tool calls from content (format: <tool_call>name: args</tool_call>)
  const toolCallRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  while ((match = toolCallRegex.exec(content)) !== null) {
    const toolContent = match[1].trim();
    const colonIndex = toolContent.indexOf(":");
    if (colonIndex !== -1) {
      toolCalls.push({
        name: toolContent.substring(0, colonIndex).trim(),
        args: toolContent.substring(colonIndex + 1).trim(),
      });
    } else {
      toolCalls.push({
        name: toolContent,
        args: "",
      });
    }
  }

  // Remove all complete thinking tags and tool call tags to get regular content
  let regular = content.replace(/<think>[\s\S]*?<\/think>/g, "");
  regular = regular.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "");

  // Check for incomplete tags (opening tag without closing tag) during streaming
  const hasIncompleteThink = /<think>(?![\s\S]*?<\/think>)/.test(regular);
  const hasIncompleteToolCall = /<tool_call>(?![\s\S]*?<\/tool_call>)/.test(
    regular
  );
  const hasIncompleteTags = hasIncompleteThink || hasIncompleteToolCall;

  // If there are incomplete tags, extract the incomplete thinking/tool content
  if (hasIncompleteThink) {
    const incompleteMatch = regular.match(/<think>([\s\S]*)$/);
    if (incompleteMatch) {
      // Add it as a streaming thinking block
      thinkingBlocks.push(incompleteMatch[1].trim() + "...");
      // Remove the incomplete tag and its content from regular
      regular = regular.replace(/<think>[\s\S]*$/, "");
    }
  }

  if (hasIncompleteToolCall) {
    const incompleteMatch = regular.match(/<tool_call>([\s\S]*)$/);
    if (incompleteMatch) {
      const toolContent = incompleteMatch[1].trim();
      const colonIndex = toolContent.indexOf(":");
      if (colonIndex !== -1) {
        toolCalls.push({
          name: toolContent.substring(0, colonIndex).trim(),
          args: toolContent.substring(colonIndex + 1).trim() + "...",
        });
      } else {
        toolCalls.push({
          name: toolContent || "loading...",
          args: "",
        });
      }
      // Remove the incomplete tag and its content from regular
      regular = regular.replace(/<tool_call>[\s\S]*$/, "");
    }
  }

  // Clean up any remaining orphaned tags
  regular = regular.replace(/<\/?think>/g, "");
  regular = regular.replace(/<\/?tool_call>/g, "");

  return {
    thinking: thinkingBlocks,
    toolCalls,
    regular: regular.trim(),
    hasIncompleteTags,
  };
}

// Component for individual thinking block with auto-scroll
function ThinkingBlock({
  block,
  index,
  total,
}: {
  block: string;
  index: number;
  total: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as content streams in
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [block]);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
          Reasoning {total > 1 ? `Step ${index + 1}` : ""}
        </span>
      </div>
      <div
        ref={contentRef}
        className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed max-h-[33vh] overflow-y-auto overflow-x-hidden"
      >
        {block}
      </div>
    </div>
  );
}

export default function App() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    append,
  } = useChat({
    api: "/api/chat",
  });

  const [config, setConfig] = useState<ConfigInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(
    new Set()
  );

  const handleNewConversation = () => {
    if (
      messages.length > 0 &&
      !confirm("Start a new conversation? This will clear the current chat.")
    ) {
      return;
    }
    setMessages([]);
    setExpandedThinking(new Set());
  };

  const handleQuickQuestion = (question: string) => {
    append({
      role: "user",
      content: question,
    });
  };

  const toggleThinking = (messageId: string) => {
    setExpandedThinking((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to fetch config:", err));
  }, []);

  return (
    <div className="h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Thoughtful AI
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Healthcare Automation Assistant
                </p>
              </div>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 shadow-sm hover:shadow cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>New Chat</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-slate-50"
        >
          <div className="p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-full text-center rounded-lg p-8">
                <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Thoughtful AI
                </h2>
                <p className="text-slate-600 mb-10 max-w-lg text-lg leading-relaxed">
                  Your intelligent assistant for healthcare automation
                  solutions. Ask me about our AI-powered agents and services.
                </p>

                <div className="w-full max-w-3xl">
                  <p className="text-sm font-semibold text-slate-700 mb-5 uppercase tracking-wide">
                    Explore Our Solutions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleQuickQuestion("What does EVA do?")}
                      className="text-left p-5 bg-white hover:bg-blue-50 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                          <span className="text-2xl">🔍</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 mb-1 text-base">
                            Eligibility Verification Agent
                          </div>
                          <div className="text-sm text-slate-600">
                            Learn about EVA's capabilities
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickQuestion("What does CAM do?")}
                      className="text-left p-5 bg-white hover:bg-emerald-50 rounded-lg border-2 border-slate-200 hover:border-emerald-500 transition-all hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                          <span className="text-2xl">📋</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 mb-1 text-base">
                            Claims Processing Agent
                          </div>
                          <div className="text-sm text-slate-600">
                            Discover CAM's automation
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickQuestion("How does PHIL work?")}
                      className="text-left p-5 bg-white hover:bg-purple-50 rounded-lg border-2 border-slate-200 hover:border-purple-500 transition-all hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 mb-1 text-base">
                            Payment Posting Agent
                          </div>
                          <div className="text-sm text-slate-600">
                            Understand PHIL's process
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleQuickQuestion(
                          "What are the benefits of using your agents?"
                        )
                      }
                      className="text-left p-5 bg-white hover:bg-amber-50 rounded-lg border-2 border-slate-200 hover:border-amber-500 transition-all hover:shadow-lg group cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
                          <span className="text-2xl">✨</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 mb-1 text-base">
                            Benefits & ROI
                          </div>
                          <div className="text-sm text-slate-600">
                            Explore value proposition
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const { thinking, toolCalls, regular, hasIncompleteTags } =
                parseContent(message.content);

              // Get tool invocations from the AI SDK message object
              const toolInvocations = (message as any).toolInvocations || [];

              const showThinking = expandedThinking.has(message.id);

              // Skip messages that have no content after parsing and no tool invocations
              if (
                !regular &&
                thinking.length === 0 &&
                toolCalls.length === 0 &&
                toolInvocations.length === 0
              )
                return null;

              // Check if this is a consecutive assistant message (hide duplicate avatars)
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage =
                index < messages.length - 1 ? messages[index + 1] : null;
              const isConsecutiveAssistant =
                message.role === "assistant" &&
                prevMessage?.role === "assistant";

              // Check if this is the last in a group of consecutive assistant messages
              const isLastInConsecutiveGroup =
                message.role === "assistant" &&
                nextMessage?.role !== "assistant";

              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} ${isConsecutiveAssistant ? "mt-2" : "mt-4"}`}
                >
                  {/* Avatar - hide for consecutive assistant messages */}
                  {!isConsecutiveAssistant && (
                    <div
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                        message.role === "user"
                          ? "bg-linear-to-br from-slate-700 to-slate-800"
                          : "bg-linear-to-br from-blue-600 to-blue-700"
                      }`}
                    >
                      {message.role === "user" ? (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Spacer for consecutive assistant messages to maintain alignment */}
                  {isConsecutiveAssistant && <div className="shrink-0 w-10" />}

                  {/* Message Content */}
                  <div
                    className={`flex-1 max-w-[75%] flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {/* Show thinking blocks for assistant messages */}
                    {message.role === "assistant" &&
                      (thinking.length > 0 ||
                        toolCalls.length > 0 ||
                        toolInvocations.length > 0) && (
                        <div
                          className={regular ? "mb-3 w-full" : "mb-0 w-full"}
                        >
                          <button
                            onClick={() => toggleThinking(message.id)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 hover:border-slate-400 transition-all shadow-sm cursor-pointer"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${showThinking ? "rotate-90" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <span className="font-semibold">
                              {showThinking ? "Hide" : "Show"} Reasoning
                              {toolCalls.length > 0 ||
                              toolInvocations.length > 0
                                ? " & Tools"
                                : ""}
                            </span>
                            <span className="text-xs text-slate-500 font-normal">
                              (
                              {thinking.length > 0 &&
                                `${thinking.length} ${thinking.length === 1 ? "step" : "steps"}`}
                              {thinking.length > 0 &&
                                (toolCalls.length > 0 ||
                                  toolInvocations.length > 0) &&
                                ", "}
                              {(toolCalls.length > 0 ||
                                toolInvocations.length > 0) &&
                                `${toolCalls.length + toolInvocations.length} ${toolCalls.length + toolInvocations.length === 1 ? "tool" : "tools"}`}
                              )
                            </span>
                          </button>

                          {showThinking && (
                            <div className="mt-3 space-y-3">
                              {thinking.map((block, idx) => (
                                <ThinkingBlock
                                  key={idx}
                                  block={block}
                                  index={idx}
                                  total={thinking.length}
                                />
                              ))}

                              {/* Show tool invocations from AI SDK */}
                              {toolInvocations.map(
                                (invocation: any, idx: number) => (
                                  <div
                                    key={`invocation-${idx}`}
                                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg
                                        className="w-4 h-4 text-emerald-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                        Tool Call{" "}
                                        {toolInvocations.length > 1
                                          ? `${idx + 1}`
                                          : ""}
                                      </span>
                                      {invocation.state === "result" && (
                                        <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                          ✓ Complete
                                        </span>
                                      )}
                                    </div>
                                    <div className="mb-2">
                                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                        Function:
                                      </span>
                                      <div className="mt-1 text-sm font-mono text-emerald-900 bg-emerald-100 px-2 py-1 rounded">
                                        {invocation.toolName}
                                      </div>
                                    </div>
                                    {invocation.args && (
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                          Arguments:
                                        </span>
                                        <div className="mt-1 text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed max-h-[20vh] overflow-y-auto overflow-x-hidden bg-emerald-100 px-2 py-1 rounded font-mono">
                                          {JSON.stringify(
                                            invocation.args,
                                            null,
                                            2
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {invocation.result && (
                                      <div>
                                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                          Result:
                                        </span>
                                        <div className="mt-1 text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed max-h-[20vh] overflow-y-auto overflow-x-hidden bg-emerald-100 px-2 py-1 rounded">
                                          {JSON.stringify(
                                            invocation.result,
                                            null,
                                            2
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}

                              {toolCalls.map((tool, idx) => (
                                <div
                                  key={`tool-${idx}`}
                                  className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg
                                      className="w-4 h-4 text-emerald-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                      Tool Call{" "}
                                      {toolCalls.length > 1 ? `${idx + 1}` : ""}
                                    </span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                      Function:
                                    </span>
                                    <div className="mt-1 text-sm font-mono text-emerald-900 bg-emerald-100 px-2 py-1 rounded">
                                      {tool.name}
                                    </div>
                                  </div>
                                  {tool.args && (
                                    <div>
                                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                        Arguments:
                                      </span>
                                      <div className="mt-1 text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed max-h-[20vh] overflow-y-auto overflow-x-hidden bg-emerald-100 px-2 py-1 rounded font-mono">
                                        {tool.args}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    {/* Only show message content box if there's actual text content */}
                    {regular && (
                      <div
                        className={`rounded-lg shadow-sm ${
                          message.role === "user"
                            ? "bg-slate-700 text-white px-5 py-3.5"
                            : "bg-white text-slate-900 border border-slate-200 px-5 py-4"
                        }`}
                      >
                        {message.role === "user" ? (
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word">
                            {regular}
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-medium hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-bold prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-slate-700">
                            <Streamdown>{regular}</Streamdown>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Timestamp - only show for the last message in a consecutive group */}
                    {(message.role === "user" || isLastInConsecutiveGroup) && (
                      <div
                        className={`text-xs text-slate-500 mt-2 px-1 flex items-center gap-1.5`}
                      >
                        <span className="font-semibold">
                          {message.role === "user" ? "You" : "Thoughtful AI"}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Only show loading if we're actually waiting (no assistant message streaming yet) */}
            {isLoading &&
              !messages.some(
                (m, idx) =>
                  idx === messages.length - 1 && m.role === "assistant"
              ) && (
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex gap-1.5">
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-700 font-semibold">
                      Processing...
                    </span>
                  </div>
                </div>
              )}

            {error && (
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="px-4 py-3 bg-red-50 text-red-900 rounded-2xl border border-red-200 shadow-sm">
                    <div className="font-semibold text-sm mb-1">Error</div>
                    <div className="text-sm">{error.message}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about our AI automation solutions..."
                disabled={isLoading}
                className="w-full px-5 py-4 text-[15px] bg-white border-2 border-slate-300 rounded-lg outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none cursor-pointer flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-slate-500">
            {config ? (
              <>
                <span className="font-semibold text-slate-600">
                  {config.provider}
                </span>
                {" • "}
                <span className="font-semibold text-slate-600">
                  {config.model}
                </span>
              </>
            ) : (
              "Loading configuration..."
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
