import { ToolInvocation as ToolInvocationType } from "../types/chat";

interface ToolInvocationProps {
  invocation: ToolInvocationType;
  index: number;
  total: number;
}

export function ToolInvocation({
  invocation,
  index,
  total,
}: ToolInvocationProps) {
  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
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
          Tool Call {total > 1 ? `${index + 1}` : ""}
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
            {JSON.stringify(invocation.args, null, 2)}
          </div>
        </div>
      )}
      {invocation.result && (
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            Result:
          </span>
          <div className="mt-1 text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed max-h-[20vh] overflow-y-auto overflow-x-hidden bg-emerald-100 px-2 py-1 rounded">
            {JSON.stringify(invocation.result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

interface ToolCallProps {
  toolCall: { name: string; args: string };
  index: number;
  total: number;
}

export function ToolCall({ toolCall, index, total }: ToolCallProps) {
  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0">
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
          Tool Call {total > 1 ? `${index + 1}` : ""}
        </span>
      </div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
          Function:
        </span>
        <div className="mt-1 text-sm font-mono text-emerald-900 bg-emerald-100 px-2 py-1 rounded">
          {toolCall.name}
        </div>
      </div>
      {toolCall.args && (
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            Arguments:
          </span>
          <div className="mt-1 text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed max-h-[20vh] overflow-y-auto overflow-x-hidden bg-emerald-100 px-2 py-1 rounded font-mono">
            {toolCall.args}
          </div>
        </div>
      )}
    </div>
  );
}
