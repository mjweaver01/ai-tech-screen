import { FormEvent } from "react";
import { ConfigInfo } from "../types/chat";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  config: ConfigInfo | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({
  input,
  isLoading,
  config,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <div className="border-t border-slate-200 bg-white p-6">
      <form onSubmit={onSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={onInputChange}
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
            <span className="font-semibold text-slate-600">{config.model}</span>
          </>
        ) : (
          "Loading configuration..."
        )}
      </div>
    </div>
  );
}
