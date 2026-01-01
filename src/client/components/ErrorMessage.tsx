interface ErrorMessageProps {
  error: Error;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
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
  );
}
