import { streamText, CoreMessage } from 'ai';
import { openai, modelName, SIMILARITY_THRESHOLD } from '../constants/llm';
import { findBestMatch, initializeEmbeddings } from '../tools/kb';
import { generateSystemPrompt } from '../constants/prompt';

// Initialize embeddings on startup
initializeEmbeddings().catch(console.error);

/**
 * Extracts the last user message from the conversation history
 */
function getLastUserMessage(messages: CoreMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      const content = messages[i].content;
      if (typeof content === 'string') {
        return content;
      }
    }
  }
  return '';
}

export async function handleChatRequest(messages: CoreMessage[]) {
  try {
    // Extract the user's current question
    const userQuestion = getLastUserMessage(messages);
    
    // Try to find a match in the knowledge base using semantic similarity
    const match = await findBestMatch(userQuestion, Number(SIMILARITY_THRESHOLD));

    // Generate the system prompt
    const systemPrompt = generateSystemPrompt(match);
    
    const result = await streamText({
      model: openai(modelName),
      messages,
      system: systemPrompt,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat handler:', error);
    throw error;
  }
}

