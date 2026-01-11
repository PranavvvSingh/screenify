import { Ollama } from 'ollama';
import type {
  JDRequirements,
  ResumeProfile,
  Question,
  GenerateQuizParams,
  GeneratedQuiz,
  OllamaError
} from '@/types/ollama';
import {
  jdRequirementsConfig,
  resumeProfileConfig,
  standardQuestionsConfig,
  verificationQuestionsConfig,
} from './ollama-config';

// Initialize Ollama client
const getOllamaClient = () => {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  const baseUrl = process.env.OLLAMA_CLOUD_API_URL || 'https://cloud.ollama.ai/api';
  const host = baseUrl.replace(/\/api\/?$/, '');

  if (!apiKey) {
    throw new Error('OLLAMA_CLOUD_API_KEY environment variable is not set');
  }

  return new Ollama({
    host,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });
};

const MODEL = process.env.OLLAMA_CLOUD_MODEL || "gpt-oss:120b-cloud";

// Utility: Retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 1,
  timeoutMs: number = 30000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

// Utility: Parse JSON response safely
// COMMENTED OUT FOR TESTING - to see raw LLM responses
// function parseJSONResponse<T>(response: string): T {
//   try {
//     // First, try to parse as-is (in case it's already pure JSON)
//     try {
//       return JSON.parse(response) as T;
//     } catch {
//       // Not pure JSON, continue with extraction
//     }

//     // Extract JSON from markdown code blocks
//     const jsonBlockMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);
//     if (jsonBlockMatch) {
//       return JSON.parse(jsonBlockMatch[1]) as T;
//     }

//     // Try to find any JSON object in the response
//     const jsonMatch = response.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[0]) as T;
//     }

//     // Remove markdown code blocks and try again
//     const cleaned = response
//       .replace(/```json\n?/g, '')
//       .replace(/```\n?/g, '')
//       .trim();

//     return JSON.parse(cleaned) as T;
//   } catch (error) {
//     throw new Error(`Invalid JSON response from Ollama API: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

// Temporary direct parsing for testing
function parseJSONResponse<T>(response: string): T {
  return JSON.parse(response) as T;
}

/**
 * Extract structured requirements from a Job Description text
 */
export async function extractJDRequirements(rawText: string): Promise<JDRequirements> {
  const ollama = getOllamaClient();

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt: jdRequirementsConfig.prompt(rawText),
      format: jdRequirementsConfig.schema,
      stream: false,
      options: {
        temperature: jdRequirementsConfig.temperature,
        top_p: jdRequirementsConfig.top_p,
      },
    });

    // console.log('📥 Raw Ollama Response for JD Requirements:');
    // console.log(response.response);

    return parseJSONResponse<JDRequirements>(response.response);
  });
}

/**
 * Extract structured profile from a Resume text
 * Focus on projects and technologies used in projects
 */
export async function extractResumeProfile(rawText: string): Promise<ResumeProfile> {
  const ollama = getOllamaClient();

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt: resumeProfileConfig.prompt(rawText),
      format: resumeProfileConfig.schema,
      stream: false,
      options: {
        temperature: resumeProfileConfig.temperature,
        top_p: resumeProfileConfig.top_p,
      },
    });

    console.log('📥 Raw Ollama Response for Resume Profile:');
    console.log(response.response);

    return parseJSONResponse<ResumeProfile>(response.response);
  });
}

/**
 * Generate standard questions (70%) based on JD requirements
 * These questions are generated once per role and reused for all candidates
 */
export async function generateStandardQuestions(
  requirements: JDRequirements,
  count: number
): Promise<Question[]> {
  const ollama = getOllamaClient();

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt: standardQuestionsConfig.prompt(requirements, count),
      format: standardQuestionsConfig.schema,
      stream: false,
      options: {
        temperature: standardQuestionsConfig.temperature,
        top_p: standardQuestionsConfig.top_p,
      },
    });

    // console.log('📥 Raw Ollama Response for Standard Questions:');
    // console.log(response.response);

    const questions = parseJSONResponse<Array<{
      question: string;
      options: string[];
      correct_answer: number;
    }>>(response.response);

    // Transform to Question type with unique IDs
    return questions.map((q, idx) => ({
      id: `std_${Date.now()}_${idx}`,
      type: 'STANDARD' as const,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
    }));
  });
}

/**
 * Generate verification questions (30%) based on candidate's resume
 * Focus on projects and technologies mentioned in the resume
 */
export async function generateVerificationQuestions(
  profile: ResumeProfile,
  count: number
): Promise<Question[]> {
  const ollama = getOllamaClient();

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt: verificationQuestionsConfig.prompt(profile, count),
      format: verificationQuestionsConfig.schema,
      stream: false,
      options: {
        temperature: verificationQuestionsConfig.temperature,
        top_p: verificationQuestionsConfig.top_p,
      },
    });

    console.log('📥 Raw Ollama Response for Verification Questions:');
    console.log(response.response);

    const questions = parseJSONResponse<Array<{
      question: string;
      options: string[];
      correct_answer: number;
    }>>(response.response);

    // Transform to Question type with unique IDs
    return questions.map((q, idx) => ({
      id: `ver_${Date.now()}_${idx}`,
      type: 'RESUME_VERIFICATION' as const,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
    }));
  });
}

/**
 * Generate complete quiz by combining and shuffling pre-generated questions
 * This is a pure function that doesn't make any API calls
 * Standard questions should be cached per role, verification questions are unique per candidate
 */
export function generateQuiz(params: GenerateQuizParams): GeneratedQuiz {
  const { standardQuestions, verificationQuestions = [] } = params;

  // Combine and shuffle all questions
  const allQuestions = [...standardQuestions, ...verificationQuestions];

  // Fisher-Yates shuffle algorithm
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return {
    standardQuestions,
    verificationQuestions,
    allQuestions,
  };
}

// Export error handling utility
export function isOllamaError(error: unknown): error is OllamaError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as OllamaError).error === 'string'
  );
}
