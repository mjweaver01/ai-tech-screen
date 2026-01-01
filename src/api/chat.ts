import { streamText, CoreMessage, tool } from "ai";
import { z } from "zod";
import { openai, modelName, SIMILARITY_THRESHOLD } from "../constants/llm";
import { findBestMatch, initializeEmbeddings } from "../tools/kb";
import { generateSystemPrompt } from "../constants/prompt";

// Initialize embeddings on startup
initializeEmbeddings().catch(console.error);

export async function handleChatRequest(messages: CoreMessage[]) {
  try {
    const result = await streamText({
      model: openai(modelName),
      messages,
      system: generateSystemPrompt(),
      tools: {
        searchKnowledgeBase: tool({
          description:
            "Search the Thoughtful AI knowledge base for information about products, services, agents (EVA, CAM, PHIL), and benefits. Use this tool to find accurate information before answering user questions.",
          parameters: z.object({
            query: z
              .string()
              .describe("The user's question or search query to look up"),
          }),
          execute: async ({ query }) => {
            console.log(`[Tool Call] Searching knowledge base for: "${query}"`);

            const match = await findBestMatch(
              query,
              Number(SIMILARITY_THRESHOLD)
            );

            if (match) {
              console.log(
                `[Knowledge Base] Found match with ${(match.similarity * 100).toFixed(1)}% similarity`
              );
              return {
                found: true,
                matchedQuestion: match.question,
                answer: match.answer,
                similarity: match.similarity,
              };
            } else {
              console.log("[Knowledge Base] No strong match found");
              return {
                found: false,
                message:
                  "No specific information found in the knowledge base. Please provide general helpful information.",
              };
            }
          },
        }),
      },
      maxSteps: 5, // Allow tool call + response generation
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat handler:", error);
    throw error;
  }
}
