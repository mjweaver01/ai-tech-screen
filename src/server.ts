import { serve } from "bun";
import { handleChatRequest } from "./api/chat";
import homepage from "../public/index.html";

const server = serve({
  port: 3000,

  routes: {
    // HTML route - Bun will automatically bundle the referenced scripts and styles
    "/": homepage,

    // API routes
    "/api/chat": {
      async POST(req) {
        try {
          const body = await req.json();
          const { messages } = body;

          if (!messages || !Array.isArray(messages)) {
            return Response.json(
              { error: "Invalid request body" },
              { status: 400 }
            );
          }

          return await handleChatRequest(messages);
        } catch (error) {
          console.error("Error handling chat request:", error);
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Internal server error",
            },
            { status: 500 }
          );
        }
      },
    },

    // Config endpoint to get model info for UI
    "/api/config": {
      GET() {
        return Response.json({
          provider: process.env.LLM_BASE_URL?.includes("localhost")
            ? "LM Studio"
            : "OpenAI",
          model: process.env.LLM_MODEL || "gpt-4.1-mini",
          baseURL: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
        });
      },
    },
  },

  // Enable development mode for hot reloading and detailed errors
  development: {
    hmr: true,
    console: true,
  },

  // Fallback for unmatched routes
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Thoughtful AI Support Agent running at ${server.url}`);
console.log(`🤖 Using model: ${process.env.LLM_MODEL || "gpt-4o-mini"}`);
console.log(
  `📡 Provider: ${process.env.LLM_BASE_URL?.includes("localhost") ? "LM Studio (Local)" : "OpenAI (Cloud)"}`
);
console.log(`📝 Make sure to set LLM_API_KEY in your .env file`);
