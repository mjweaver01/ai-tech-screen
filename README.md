# Thoughtful AI Support Agent

A conversational AI support agent built with Bun's fullstack dev server, React, and OpenAI (or LM Studio) that answers questions about Thoughtful AI's healthcare automation agents.

## Features

- **Semantic Search with Embeddings**: Uses OpenAI embeddings and cosine similarity to match user questions against the knowledge base
- **Intelligent Matching**: Automatically finds the most relevant predefined answer based on semantic meaning, not exact text
- **Configurable Similarity Threshold**: Adjustable threshold (default 70%) to balance precision and recall
- **Predefined Answers**: Provides exact, curated answers for questions about EVA, CAM, PHIL, and Thoughtful AI's agents
- **LLM Fallback**: Handles general questions naturally when not in the knowledge base
- **Flexible AI Backend**: Works with OpenAI API or local LM Studio
- **Rich Markdown Support**: Powered by Streamdown for proper rendering of formatted responses
  - Code blocks with syntax highlighting
  - Tables, lists, and task lists
  - Math expressions (LaTeX/KaTeX)
  - Graceful handling of streaming chunks
- **Modern UI**: Clean, responsive chat interface built with React and Tailwind CSS v4
- **Streaming Responses**: Real-time streaming for natural conversation experience
- **Hot Module Reloading**: Bun's fullstack dev server with instant updates
- **No Build Step**: Source files served and bundled on-the-fly in dev AND production

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) v1.3+
- **Backend**: [Bun Fullstack Dev Server](https://bun.sh/docs/api/http) with Routes
- **Frontend**: [React](https://react.dev) 18 with TypeScript
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/docs) with [OpenAI](https://platform.openai.com/docs) or [LM Studio](https://lmstudio.ai/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (via [bun-plugin-tailwind](https://github.com/connordotfun/bun-plugin-tailwind))
- **Bundling**: Bun's native bundler (automatic, no build step)

## Prerequisites

- [Bun](https://bun.sh) v1.3 or higher
- An LLM provider: [OpenAI API key](https://platform.openai.com/api-keys) OR [LM Studio](https://lmstudio.ai/) running locally

## Quick Start

### 1. Install Dependencies

```bash
cd ai-tech-screen
bun install
```

### 2. Configure AI Backend

Create a `.env` file in the project root:

**Option 1: OpenAI (Cloud)**

```env
LLM_API_KEY=sk-your-actual-openai-api-key-here
LLM_MODEL=gpt-4.1-mini
EMBEDDING_MODEL=text-embedding-3-small
```

**Option 2: LM Studio (Local - No API costs!)**

```env
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=not-needed
LLM_MODEL=qwen3-1.7b
EMBEDDING_MODEL=text-embedding-3-small  # Note: Still requires OpenAI API for embeddings
```

> **Note**: Even when using LM Studio for chat, you'll need an OpenAI API key for generating embeddings, unless you use a local embedding provider.

**Option 3: Other OpenAI-Compatible Providers**

```env
LLM_BASE_URL=https://api.groq.com/openai/v1  # Example: Groq
LLM_API_KEY=your-groq-api-key
LLM_MODEL=llama-3.1-70b-versatile
EMBEDDING_MODEL=text-embedding-3-small  # Embeddings still use OpenAI
```

> **Note**: When using LM Studio, the model name can be anything - it uses whatever model is currently loaded in LM Studio. Embeddings currently require OpenAI API or a compatible provider.

### 3. Start Development Server

```bash
bun run dev
```

The application will be available at: **http://localhost:3000**

Bun's fullstack dev server automatically:

- Bundles React + TypeScript on-the-fly
- Processes Tailwind CSS through the plugin
- Hot reloads on file changes
- Streams console logs from browser to terminal

## Usage

### Try These Questions

The agent has predefined answers for these topics:

1. **"What does EVA do?"** - Eligibility Verification Agent
2. **"What does CAM do?"** - Claims Processing Agent
3. **"How does PHIL work?"** - Payment Posting Agent
4. **"Tell me about Thoughtful AI's agents"** - Overview of all agents
5. **"What are the benefits of using your agents?"** - Advantages

### General Questions

Ask anything else and the agent responds naturally:

- "What's the weather like?"
- "Tell me a joke"
- "How do I learn programming?"

## Project Structure

```
ai-tech-screen/
├── src/
│   ├── api/
│   │   └── chat.ts              # Chat API handler with semantic search
│   ├── client/
│   │   ├── App.tsx              # React chat UI component
│   │   ├── index.tsx            # React entry point
│   │   └── styles.css           # Tailwind CSS source
│   ├── constants/
│   │   ├── llm.ts               # LLM configuration
│   │   └── prompt.ts            # System prompts
│   ├── tools/
│   │   └── kb.ts                # Knowledge base with embedding search
│   └── server.ts                # Bun fullstack server
├── public/
│   └── index.html               # HTML entry (references src files)
├── bunfig.toml                  # Bun config (Tailwind plugin)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

## How It Works

### Bun Fullstack Dev Server

The app uses Bun's new fullstack dev server pattern:

1. **HTML Import**: `import homepage from '../public/index.html'`
2. **Routes Object**: Maps URLs to HTML files and API handlers
3. **Auto-Bundling**: Bun scans HTML for `<script>` and `<link>` tags
4. **On-the-Fly Processing**:
   - TypeScript/React → JavaScript
   - Tailwind CSS → Compiled CSS
   - All bundled and served automatically
5. **Hot Reloading**: Changes update instantly in the browser

### Semantic Search with Embeddings

1. **Initialization**: On server startup, embeddings are computed for all knowledge base questions
2. **User Query**: User asks a question, sent to `/api/chat` endpoint
3. **Embedding Generation**: User's question is converted to an embedding vector
4. **Similarity Search**: Cosine similarity calculated between user embedding and all KB embeddings
5. **Threshold Check**: If similarity > 70%, the matched answer is injected into LLM context
6. **LLM Response**: LLM presents the KB answer naturally, or generates general response if no match
7. **Streaming**: Response streamed back to browser in real-time

### Architecture Flow

```
User Browser
    ↓
Bun.serve({ routes })
    ↓
├─ "/" → HTML (auto-bundled)
├─ "/api/chat" → Chat handler
    ↓
┌─────────────────────────────────┐
│  Embedding-Based Semantic Search│
│  1. Embed user question         │
│  2. Compare with KB embeddings  │
│  3. Calculate cosine similarity │
│  4. Find best match (>70%)      │
└─────────────────────────────────┘
    ↓
┌─────────────────┬──────────────────┐
│ KB Answer Found │  No Match Found  │
│ (inject to LLM) │  (LLM fallback)  │
└─────────────────┴──────────────────┘
    ↓
Stream to Browser (SSE)
```

## Development

### Available Scripts

```bash
# Development
bun run dev

# Production
bun start
```

### Adding New Questions

Edit `src/tools/kb.ts`:

```typescript
export const knowledgeBase: QAPair[] = [
  // ... existing pairs
  {
    question: "Your new question?",
    answer: "Your new answer.",
  },
];
```

Embeddings are automatically generated on server startup - no manual configuration needed! The system uses semantic search to match user questions to the most relevant KB entry, even if worded differently.

### Adjusting the Similarity Threshold

In `src/api/chat.ts`, you can adjust how strict the matching is:

```typescript
const match = await findBestMatch(userQuestion, 0.7); // 0.7 = 70% similarity

// Lower threshold (0.5) = more matches, less precise
// Higher threshold (0.85) = fewer matches, more precise
```

## Bun-Specific Features Used

1. **Fullstack Routes** - HTML imports + API routes in one server
2. **Auto-Bundling** - On-the-fly bundling in dev and production (no build step!)
3. **Tailwind Plugin** - Processes CSS automatically via `bunfig.toml`
4. **Hot Module Reloading** - Built-in HMR for instant updates
5. **Native TypeScript** - No transpilation config needed
6. **Fast Install** - Lightning-fast `bun install`
7. **Development Mode** - `development: { hmr: true, console: true }`
8. **Production Ready** - Same command works for dev and production

## Configuration

### bunfig.toml

```toml
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

This enables automatic Tailwind CSS processing when serving static files.

### Environment Variables

```env
# LLM Provider Configuration (provider-agnostic)
LLM_API_KEY=sk-...                          # API key for your provider
LLM_BASE_URL=https://api.openai.com/v1     # API base URL
LLM_MODEL=gpt-4.1-mini                      # Chat model name
EMBEDDING_MODEL=text-embedding-3-small      # Embedding model for semantic search

# Examples:
# OpenAI: LLM_BASE_URL=https://api.openai.com/v1, LLM_MODEL=gpt-4.1-mini
# LM Studio: LLM_BASE_URL=http://localhost:1234/v1, LLM_MODEL=any-name
# Groq: LLM_BASE_URL=https://api.groq.com/openai/v1, LLM_MODEL=llama-3.1-70b
# Together: LLM_BASE_URL=https://api.together.xyz/v1, LLM_MODEL=meta-llama/Llama-3-70b

# Embedding Model Options (OpenAI):
# text-embedding-3-small  - Fast, cost-effective (default)
# text-embedding-3-large  - Higher accuracy, more expensive
# text-embedding-ada-002  - Legacy model

# Optional:
NODE_ENV=production                         # Disables HMR and minifies
PORT=3000                                   # Server port
```

## Troubleshooting

### Missing API Key

- Create `.env` file in project root
- Add `LLM_API_KEY` or configure your provider
- Restart the server

### Using LM Studio

1. Download [LM Studio](https://lmstudio.ai/)
2. Load a model (e.g., Llama, Mistral, Phi, etc.)
3. Start the server (Settings → Server → Start)
4. Configure `.env`:

   ```env
   LLM_BASE_URL=http://localhost:1234/v1
   LLM_API_KEY=not-needed
   LLM_MODEL=qwen3-1.7b
   EMBEDDING_MODEL=text-embedding-3-small
   ```

   > **Important**: You'll still need an OpenAI API key in `.env` for embeddings:

   ```env
   LLM_BASE_URL=http://localhost:1234/v1
   LLM_API_KEY=sk-your-openai-key  # For embeddings only
   LLM_MODEL=qwen3-1.7b
   EMBEDDING_MODEL=text-embedding-3-small
   ```

5. Run `bun run dev`

**LM Studio Benefits:**

- 🔒 Complete privacy (runs locally)
- 💰 No API costs
- ⚡ Fast responses with good hardware
- 🎯 Use any open-source model (Llama, Mistral, Phi, etc.)
- 🔄 Switch models without code changes

### LM Studio Connection Issues

- Verify LM Studio server is running on port 1234
- Check model is loaded in LM Studio
- Look at LM Studio's server logs for errors
- Ensure no firewall blocking localhost

### Using Other Providers

The app works with any OpenAI-compatible API:

**Groq (Fast inference)**

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=your-groq-api-key
LLM_MODEL=llama-3.1-70b-versatile
```

**Together AI**

```env
LLM_BASE_URL=https://api.together.xyz/v1
LLM_API_KEY=your-together-api-key
LLM_MODEL=meta-llama/Llama-3-70b-chat
```

**OpenRouter (Access to many models)**

```env
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-openrouter-api-key
LLM_MODEL=anthropic/claude-3-opus
```

### Port 3000 In Use

- Stop other apps using port 3000
- Or change port in `src/server.ts`: `port: 3001`

### Styles Not Applying

- Check `bunfig.toml` exists with Tailwind plugin
- Verify `tailwindcss` is in `package.json` devDependencies
- Restart dev server

## Evaluation Criteria Met

### ✅ Functionality

- Conversational AI interface with real-time chat
- Semantic matching to retrieve predefined answers
- LLM fallback for general questions
- User-friendly, modern UI

### ✅ Code Quality

- Clean, type-safe TypeScript throughout
- Modular architecture (API, UI, knowledge base separated)
- Modern stack: Bun fullstack server, AI SDK, React
- Follows Bun's official patterns

### ✅ Robustness

- Error handling for invalid requests
- Graceful fallback when no match found
- Network error handling with user feedback
- Flexible AI backend (OpenAI or local LLM)

## Deployment

### Running in Production

```bash
# Run the server directly - no build step needed!
NODE_ENV=production bun start
```

Bun's fullstack server is production-ready and handles bundling on-the-fly with excellent performance. The same source code runs in both development and production.

### Docker

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "src/server.ts"]
```

### Platform Deployment

Works great on any platform that supports Bun:

- **Fly.io**: Native Bun support
- **Railway**: Native Bun support
- **Render**: Native Bun support
- **Any VPS**: Install Bun and run `bun start`

No build step required - Bun handles everything!

## License

MIT

## Author

Built for Thoughtful AI technical assessment

---

**Key Highlights:**

- ⚡ Pure Bun - No webpack, no Vite, no Next.js needed
- 🎨 Tailwind CSS v4 - Latest CSS-first approach
- 🤖 Dual AI Backend - OpenAI or local LM Studio
- 🔥 Hot Reloading - Instant updates in development
- 📦 Zero Config - Works out of the box with Bun
- 🚀 No Build Step - Same code runs in dev and production
- 🎯 Semantic Search - Intelligent question matching with embeddings
