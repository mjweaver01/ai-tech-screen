import { useEffect, useRef } from "react";

interface ThinkingBlockProps {
  block: string;
  index: number;
  total: number;
}

export function ThinkingBlock({ block, index, total }: ThinkingBlockProps) {
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
