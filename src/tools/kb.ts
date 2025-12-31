import { embed } from "ai";
import { openai, embeddingModel } from "../constants/llm";

export interface QAPair {
  question: string;
  answer: string;
  embedding?: number[];
}

export const knowledgeBase: QAPair[] = [
  {
    question: "What does the eligibility verification agent (EVA) do?",
    answer:
      "EVA automates the process of verifying a patient's eligibility and benefits information in real-time, eliminating manual data entry errors and reducing claim rejections.",
  },
  {
    question: "What does the claims processing agent (CAM) do?",
    answer:
      "CAM streamlines the submission and management of claims, improving accuracy, reducing manual intervention, and accelerating reimbursements.",
  },
  {
    question: "How does the payment posting agent (PHIL) work?",
    answer:
      "PHIL automates the posting of payments to patient accounts, ensuring fast, accurate reconciliation of payments and reducing administrative burden.",
  },
  {
    question: "Tell me about Thoughtful AI's Agents.",
    answer:
      "Thoughtful AI provides a suite of AI-powered automation agents designed to streamline healthcare processes. These include Eligibility Verification (EVA), Claims Processing (CAM), and Payment Posting (PHIL), among others.",
  },
  {
    question: "What are the benefits of using Thoughtful AI's agents?",
    answer:
      "Using Thoughtful AI's Agents can significantly reduce administrative costs, improve operational efficiency, and reduce errors in critical processes like claims management and payment posting.",
  },
];

// Cache for embeddings to avoid recomputing
let embeddingsInitialized = false;

/**
 * Initialize embeddings for all knowledge base questions
 */
export async function initializeEmbeddings() {
  if (embeddingsInitialized) return;

  console.log("Initializing knowledge base embeddings...");

  for (const qa of knowledgeBase) {
    if (!qa.embedding) {
      const { embedding } = await embed({
        model: openai.embedding(embeddingModel),
        value: qa.question,
      });
      qa.embedding = embedding;
    }
  }

  embeddingsInitialized = true;
  console.log("Knowledge base embeddings initialized");
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface KnowledgeBaseMatch {
  question: string;
  answer: string;
  similarity: number;
}

/**
 * Find the best matching answer from the knowledge base using semantic similarity
 * @param userQuestion The user's question
 * @param threshold Minimum similarity score (0-1) to consider a match. Default: 0.7
 * @returns The best matching answer if similarity exceeds threshold, null otherwise
 */
export async function findBestMatch(
  userQuestion: string,
  threshold: number = 0.7
): Promise<KnowledgeBaseMatch | null> {
  // Ensure embeddings are initialized
  await initializeEmbeddings();

  // Get embedding for user's question
  const { embedding: questionEmbedding } = await embed({
    model: openai.embedding(embeddingModel),
    value: userQuestion,
  });

  // Find best match by comparing similarities
  let bestMatch: KnowledgeBaseMatch | null = null;
  let highestSimilarity = threshold;

  for (const qa of knowledgeBase) {
    if (qa.embedding) {
      const similarity = cosineSimilarity(questionEmbedding, qa.embedding);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = {
          question: qa.question,
          answer: qa.answer,
          similarity,
        };
      }
    }
  }

  return bestMatch;
}
