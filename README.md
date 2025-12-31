# Thoughtful AI Support Agent

A conversational AI support agent built with Bun's fullstack dev server, React, and OpenAI (or LM Studio) that answers questions about Thoughtful AI's healthcare automation agents.

## Features

- **Smart Question Routing**: Uses LLM function calling to match user questions against predefined knowledge base
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
- **No Build Step in Dev**: Source files served and bundled on-the-fly

## Tech Stack

- **Runtime**: Bun v1.3+
- **Backend**: Bun Fullstack Dev Server with Routes
- **Frontend**: React 18 with TypeScript
- **AI**: Vercel AI SDK with OpenAI or LM Studio
- **Styling**: Tailwind CSS v4 (via bun-plugin-tailwind)
- **Bundling**: Bun's native bundler (automatic in dev mode)

## Prerequisites

- [Bun](https://bun.sh) v1.3 or higher
- An LLM provider: OpenAI API key OR [LM Studio](https://lmstudio.ai/) running locally

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
```

**Option 2: LM Studio (Local - No API costs!)**
```env
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=not-needed
LLM_MODEL=qwen3-1.7b
```

**Option 3: Other OpenAI-Compatible Providers**
```env
LLM_BASE_URL=https://api.groq.com/openai/v1  # Example: Groq
LLM_API_KEY=your-groq-api-key
LLM_MODEL=llama-3.1-70b-versatile
```

> **Note**: When using LM Studio, the model name can be anything - it uses whatever model is currently loaded in LM Studio.

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
│   │   └── chat.ts              # Chat API handler with LLM routing
│   ├── client/
│   │   ├── App.tsx              # React chat UI component
│   │   ├── index.tsx            # React entry point
│   │   └── styles.css           # Tailwind CSS source
│   ├── knowledge-base.ts        # Predefined Q&A data
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

### Question Routing with LLM

1. User asks a question
2. Sent to `/api/chat` endpoint
3. LLM analyzes question with function calling
4. If matched to predefined topic → return exact answer
5. If not matched → LLM generates natural response
6. Response streamed back in real-time

### Architecture Flow

```
User Browser
    ↓
Bun.serve({ routes })
    ↓
├─ "/" → HTML (auto-bundled)
├─ "/api/chat" → Chat handler
    ↓
LLM Function Calling
    ↓
┌─────────────────┬──────────────────┐
│ Predefined KB   │   LLM Response   │
└─────────────────┴──────────────────┘
    ↓
Stream to Browser (SSE)
```

## Development

### Available Scripts

```bash
# Development (no build needed!)
bun run dev

# Production build
bun run build

# Production start
bun start
```

### Adding New Questions

Edit `src/knowledge-base.ts`:

```typescript
export const knowledgeBase: QAPair[] = [
  // ... existing pairs
  {
    question: "Your new question?",
    answer: "Your new answer."
  }
];
```

The LLM automatically handles semantic matching - no need to update enums or IDs!

## Bun-Specific Features Used

1. **Fullstack Routes** - HTML imports + API routes in one server
2. **Auto-Bundling** - No manual build in development
3. **Tailwind Plugin** - Processes CSS automatically via `bunfig.toml`
4. **Hot Module Reloading** - Built-in HMR
5. **Native TypeScript** - No transpilation needed
6. **Fast Install** - Lightning-fast `bun install`
7. **Development Mode** - `development: { hmr: true, console: true }`

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
LLM_API_KEY=sk-...                       # API key for your provider
LLM_BASE_URL=https://api.openai.com/v1  # API base URL
LLM_MODEL=gpt-4o-mini                    # Model name

# Examples:
# OpenAI: LLM_BASE_URL=https://api.openai.com/v1, LLM_MODEL=gpt-4
# LM Studio: LLM_BASE_URL=http://localhost:1234/v1, LLM_MODEL=any-name
# Groq: LLM_BASE_URL=https://api.groq.com/openai/v1, LLM_MODEL=llama-3.1-70b
# Together: LLM_BASE_URL=https://api.together.xyz/v1, LLM_MODEL=meta-llama/Llama-3-70b

# Optional:
NODE_ENV=production                      # Disables HMR and minifies
PORT=3000                                # Server port
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

### Production Build

```bash
# Build the application
bun run build

# Run in production
NODE_ENV=production bun start
```

This creates an optimized bundle in `dist/` with:
- Minified JavaScript
- Bundled assets with content hashes
- Cached for fast serving

### Docker

```dockerfile
FROM oven/bun:1 as build
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "dist/server.js"]
```

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
