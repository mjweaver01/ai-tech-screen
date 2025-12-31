import { KnowledgeBaseMatch } from "../tools/kb";

export function generateSystemPrompt(match: KnowledgeBaseMatch | null): string {
  // If we found a good match, inject it into the context
  let systemPrompt = `You are a helpful customer support agent for Thoughtful AI, a healthcare automation company that provides AI-powered automation agents for healthcare processes.`;

  if (match) {
    systemPrompt += `\n\nThe user's question matches this from our knowledge base:
      Question: "${match.question}"
      Answer: "${match.answer}"

      Please provide this information to the user in a natural, conversational way. You can rephrase or expand on the answer if helpful, but make sure to include all the key information from the knowledge base answer.
    `;

    console.log(
      `[Knowledge Base] Matched question with ${(match.similarity * 100).toFixed(1)}% similarity`
    );
  } else {
    systemPrompt += `\n\nThe user's question doesn't match our specific knowledge base. Answer helpfully as a knowledgeable AI assistant, but be clear when you're providing general information vs. specific Thoughtful AI product information.`;

    console.log(
      "[Knowledge Base] No strong match found, using general LLM knowledge"
    );
  }
  return systemPrompt;
}
