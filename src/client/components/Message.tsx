import { Streamdown } from "streamdown";
import { Message as MessageType } from "@ai-sdk/react";
import { parseContent } from "../utils/contentParser";
import { ThinkingBlock } from "./ThinkingBlock";
import { ToolInvocation, ToolCall } from "./ToolInvocation";

interface MessageProps {
  message: MessageType & { toolInvocations?: any[] };
  index: number;
  messages: MessageType[];
  expandedThinking: Set<string>;
  onToggleThinking: (id: string) => void;
}

export function Message({
  message,
  index,
  messages,
  expandedThinking,
  onToggleThinking,
}: MessageProps) {
  const { thinking, toolCalls, regular } = parseContent(message.content);

  // Get tool invocations from the AI SDK message object
  const toolInvocations = message.toolInvocations || [];

  const showThinking = expandedThinking.has(message.id);

  // Skip messages that have no content after parsing and no tool invocations
  if (
    !regular &&
    thinking.length === 0 &&
    toolCalls.length === 0 &&
    toolInvocations.length === 0
  ) {
    return null;
  }

  // Check if this is a consecutive assistant message (hide duplicate avatars)
  const prevMessage = index > 0 ? messages[index - 1] : null;
  const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
  const isConsecutiveAssistant =
    message.role === "assistant" && prevMessage?.role === "assistant";

  // Check if this is the last in a group of consecutive assistant messages
  const isLastInConsecutiveGroup =
    message.role === "assistant" && nextMessage?.role !== "assistant";

  return (
    <div
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
            <div className={regular ? "mb-3 w-full" : "mb-0 w-full"}>
              <button
                onClick={() => onToggleThinking(message.id)}
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
                  {toolCalls.length > 0 || toolInvocations.length > 0
                    ? " & Tools"
                    : ""}
                </span>
                <span className="text-xs text-slate-500 font-normal">
                  (
                  {thinking.length > 0 &&
                    `${thinking.length} ${thinking.length === 1 ? "step" : "steps"}`}
                  {thinking.length > 0 &&
                    (toolCalls.length > 0 || toolInvocations.length > 0) &&
                    ", "}
                  {(toolCalls.length > 0 || toolInvocations.length > 0) &&
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
                  {toolInvocations.map((invocation: any, idx: number) => (
                    <ToolInvocation
                      key={`invocation-${idx}`}
                      invocation={invocation}
                      index={idx}
                      total={toolInvocations.length}
                    />
                  ))}

                  {toolCalls.map((tool, idx) => (
                    <ToolCall
                      key={`tool-${idx}`}
                      toolCall={tool}
                      index={idx}
                      total={toolCalls.length}
                    />
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
}

