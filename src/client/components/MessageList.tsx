import { useRef, useEffect } from "react";
import { Message as MessageType } from "@ai-sdk/react";
import { Message } from "./Message";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorMessage } from "./ErrorMessage";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  error: Error | undefined;
  expandedThinking: Set<string>;
  onToggleThinking: (id: string) => void;
  onQuickQuestion: (question: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  error,
  expandedThinking,
  onToggleThinking,
  onQuickQuestion,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto bg-slate-50"
    >
      <div className="p-6">
        {messages.length === 0 && (
          <EmptyState onQuickQuestion={onQuickQuestion} />
        )}

        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message as MessageType & { toolInvocations?: any[] }}
            index={index}
            messages={messages}
            expandedThinking={expandedThinking}
            onToggleThinking={onToggleThinking}
          />
        ))}

        {/* Only show loading if we're actually waiting (no assistant message streaming yet) */}
        {isLoading &&
          !messages.some(
            (m, idx) => idx === messages.length - 1 && m.role === "assistant"
          ) && <LoadingIndicator />}

        {error && <ErrorMessage error={error} />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

