interface EmptyStateProps {
  onQuickQuestion: (question: string) => void;
}

export function EmptyState({ onQuickQuestion }: EmptyStateProps) {
  const quickQuestions = [
    {
      question: "What does EVA do?",
      title: "Eligibility Verification Agent",
      description: "Learn about EVA's capabilities",
      emoji: "🔍",
      color: "blue",
    },
    {
      question: "What does CAM do?",
      title: "Claims Processing Agent",
      description: "Discover CAM's automation",
      emoji: "📋",
      color: "emerald",
    },
    {
      question: "How does PHIL work?",
      title: "Payment Posting Agent",
      description: "Understand PHIL's process",
      emoji: "💳",
      color: "purple",
    },
    {
      question: "What are the benefits of using your agents?",
      title: "Benefits & ROI",
      description: "Explore value proposition",
      emoji: "✨",
      color: "amber",
    },
  ];

  return (
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
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Thoughtful AI</h2>
      <p className="text-slate-600 mb-10 max-w-lg text-lg leading-relaxed">
        Your intelligent assistant for healthcare automation solutions. Ask me
        about our AI-powered agents and services.
      </p>

      <div className="w-full max-w-3xl">
        <p className="text-sm font-semibold text-slate-700 mb-5 uppercase tracking-wide">
          Explore Our Solutions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickQuestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onQuickQuestion(item.question)}
              className={`text-left p-5 bg-white hover:bg-${item.color}-50 rounded-lg border-2 border-slate-200 hover:border-${item.color}-500 transition-all hover:shadow-lg group cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-${item.color}-200 transition-colors`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-1 text-base">
                    {item.title}
                  </div>
                  <div className="text-sm text-slate-600">
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
