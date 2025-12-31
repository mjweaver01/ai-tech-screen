import { createOpenAI } from '@ai-sdk/openai';

// Support any OpenAI-compatible provider (OpenAI, LM Studio, etc.)
export const baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
export const apiKey = process.env.LLM_API_KEY || 'not-needed'; // Some local providers don't need a key
export const modelName = process.env.LLM_MODEL || 'gpt-4.1-mini';
export const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
export const SIMILARITY_THRESHOLD = process.env.SIMILARITY_THRESHOLD || 0.7;

export const openai = createOpenAI({
  baseURL,
  apiKey,
});

