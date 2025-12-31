import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";

interface ConfigInfo {
  provider: string;
  model: string;
  baseURL: string;
}

// Function to strip <think> tags from content (handles complete pairs and incomplete streaming tags)
function stripThinkTags(content: string): string {
  // Remove complete <think>...</think> pairs
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "");
  // Remove any remaining opening or closing tags (for incomplete streaming chunks)
  cleaned = cleaned.replace(/<\/?think>/g, "");
  return cleaned.trim();
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
  } = useChat({
    api: "/api/chat",
  });

  const [config, setConfig] = useState<ConfigInfo | null>(null);

  const handleNewConversation = () => {
    if (
      messages.length > 0 &&
      !confirm("Start a new conversation? This will clear the current chat.")
    ) {
      return;
    }
    setMessages([]);
  };

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to fetch config:", err));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 border-b border-slate-200 shadow-sm sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Thoughtful AI
                </h1>
                <p className="text-sm text-slate-600">
                  Healthcare Automation Support
                </p>
              </div>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-linear-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                  Welcome to Thoughtful AI Support
                </h2>
                <p className="text-slate-600 mb-8 max-w-md">
                  I'm here to help you learn about our AI-powered healthcare
                  automation agents. Ask me anything!
                </p>

                <div className="w-full max-w-2xl">
                  <p className="text-sm font-medium text-slate-700 mb-4">
                    Try asking about:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        handleInputChange({
                          target: { value: "What does EVA do?" },
                        } as any)
                      }
                      className="text-left p-4 bg-linear-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔍</span>
                        <div>
                          <div className="font-medium text-slate-900 group-hover:text-indigo-700">
                            Eligibility Verification
                          </div>
                          <div className="text-sm text-slate-600">
                            Learn about EVA
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleInputChange({
                          target: { value: "What does CAM do?" },
                        } as any)
                      }
                      className="text-left p-4 bg-linear-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                          <div className="font-medium text-slate-900 group-hover:text-emerald-700">
                            Claims Processing
                          </div>
                          <div className="text-sm text-slate-600">
                            Learn about CAM
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleInputChange({
                          target: { value: "How does PHIL work?" },
                        } as any)
                      }
                      className="text-left p-4 bg-linear-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border border-purple-200 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💳</span>
                        <div>
                          <div className="font-medium text-slate-900 group-hover:text-purple-700">
                            Payment Posting
                          </div>
                          <div className="text-sm text-slate-600">
                            Learn about PHIL
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleInputChange({
                          target: {
                            value:
                              "What are the benefits of using your agents?",
                          },
                        } as any)
                      }
                      className="text-left p-4 bg-linear-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border border-amber-200 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">✨</span>
                        <div>
                          <div className="font-medium text-slate-900 group-hover:text-amber-700">
                            Benefits & ROI
                          </div>
                          <div className="text-sm text-slate-600">
                            Why Thoughtful AI?
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const cleanContent = stripThinkTags(message.content);
              if (!cleanContent) return null; // Skip empty messages after stripping

              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      message.role === "user"
                        ? "bg-linear-to-br from-indigo-600 to-purple-600"
                        : "bg-white border-2 border-slate-200"
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
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 max-w-[75%] flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl shadow-sm ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white px-5 py-3"
                          : "bg-white text-slate-900 border border-slate-200 px-5 py-4"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-word">
                          {cleanContent}
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-semibold prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                          <Streamdown>{cleanContent}</Streamdown>
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-xs text-slate-500 mt-2 px-1 flex items-center gap-1.5`}
                    >
                      <span className="font-medium">
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
                  <div className="shrink-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex gap-1.5">
                      <div
                        className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 font-medium">
                      Thinking...
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
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about our AI agents..."
                  disabled={isLoading}
                  className="w-full px-5 py-4 text-[15px] bg-white border-2 border-slate-300 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100 disabled:cursor-not-allowed placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="relative px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-xl disabled:shadow-none group overflow-hidden"
              >
                {/* Background shine effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                <div className="relative flex items-center justify-center gap-2 min-w-[80px]">
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
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <svg
                        className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
            <div className="mt-3 text-center text-xs text-slate-500">
              {config ? (
                <>
                  Powered by{" "}
                  <span className="font-medium text-slate-700">
                    {config.provider}
                  </span>
                  {" • "}
                  Model:{" "}
                  <span className="font-medium text-slate-700">
                    {config.model}
                  </span>
                </>
              ) : (
                "Loading configuration..."
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
