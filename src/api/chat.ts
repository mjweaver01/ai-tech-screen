import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, CoreMessage } from 'ai';
import { z } from 'zod';
import { getAllQuestions, getAnswerByIndex } from '../knowledge-base';

// Support any OpenAI-compatible provider (OpenAI, LM Studio, etc.)
const baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const apiKey = process.env.LLM_API_KEY || 'not-needed'; // Some local providers don't need a key
const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';

const openai = createOpenAI({
  baseURL,
  apiKey,
});

export async function handleChatRequest(messages: CoreMessage[]) {
  try {
    // Get all available questions from knowledge base
    const questions = getAllQuestions();
    
    const result = await streamText({
      model: openai(modelName),
      messages,
      tools: {
        get_predefined_answer: tool({
          description: `Search Thoughtful AI's knowledge base for a predefined answer. Use this when the user's question is similar to one of these predefined questions: ${questions.map((q, i) => `[${i}] ${q}`).join('; ')}`,
          parameters: z.object({
            question_index: z.number()
              .min(0)
              .max(questions.length - 1)
              .describe(`The index (0-${questions.length - 1}) of the predefined question that best matches the user's question`)
          }),
          execute: async ({ question_index }) => {
            const answer = getAnswerByIndex(question_index);
            return { 
              answer: answer || 'Answer not found',
              matched_question: questions[question_index] || 'Unknown'
            };
          }
        })
      },
      toolChoice: 'auto',
      maxSteps: 5,
      system: `You are a helpful customer support agent for Thoughtful AI, a healthcare automation company.

You have access to a knowledge base with these predefined questions and answers:
${questions.map((q, i) => `[${i}] ${q}`).join('\n')}

When a user asks a question that is semantically similar to any of these predefined questions (even if worded differently), use the get_predefined_answer tool with the appropriate question_index.

Examples of user questions that should match:
- "Tell me about EVA" or "What's EVA?" → index 0
- "What does CAM do?" or "Explain CAM" → index 1
- "How does PHIL work?" or "Tell me about payment posting" → index 2
- "What agents do you have?" or "List your products" → index 3
- "Why use your agents?" or "What are the advantages?" → index 4

When you use the tool and get a predefined answer, present it naturally to the user.

For questions unrelated to Thoughtful AI's specific products, answer helpfully as a knowledgeable AI assistant without using the tool.`
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat handler:', error);
    throw error;
  }
}

