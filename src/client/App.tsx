import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { ConfigInfo } from "./types/chat";

const MESSAGES_STORAGE_KEY = "thoughtful-ai-messages";

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
    initialMessages: (() => {
      try {
        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Failed to load messages from localStorage:", e);
        return [];
      }
    })(),
  });

  const [config, setConfig] = useState<ConfigInfo | null>(null);
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
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
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

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  }, [messages]);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to fetch config:", err));
  }, []);

  return (
    <div className="h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 flex flex-col overflow-hidden">
      <Header
        hasMessages={messages.length > 0}
        onNewConversation={handleNewConversation}
      />

      <main className="flex-1 flex flex-col w-full overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          expandedThinking={expandedThinking}
          onToggleThinking={toggleThinking}
          onQuickQuestion={handleQuickQuestion}
        />

        <ChatInput
          input={input}
          isLoading={isLoading}
          config={config}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
