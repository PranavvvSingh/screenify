import { Ollama } from 'ollama';
import type {
  JDRequirements,
  ResumeProfile,
  Question,
  GenerateQuizParams,
  GeneratedQuiz,
  OllamaError
} from '@/types/ollama';

// JSON Schemas for structured outputs (using snake_case to match TypeScript types)
const JDRequirementsSchema = {
  type: 'object',
  properties: {
    job_title: { type: 'string' },
    department: { type: 'string' },
    required_skills: {
      type: 'array',
      items: { type: 'string' }
    },
    preferred_skills: {
      type: 'array',
      items: { type: 'string' }
    },
    experience: {
      type: 'object',
      properties: {
        min_years: { type: 'number' },
        max_years: { type: 'number' }
      },
      required: ['min_years', 'max_years']
    },
    responsibilities: {
      type: 'array',
      items: { type: 'string' }
    },
    qualifications: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['job_title', 'required_skills', 'preferred_skills', 'experience', 'responsibilities', 'qualifications']
};

const ResumeProfileSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    skills: {
      type: 'array',
      items: { type: 'string' }
    },
    experience_years: { type: 'number' },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: {
            type: 'array',
            items: { type: 'string' }
          },
          role: { type: 'string' },
          duration: { type: 'string' }
        },
        required: ['name', 'description', 'technologies']
      }
    },
    education: {
      type: 'array',
      items: { type: 'string' }
    },
    certifications: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['skills', 'experience_years', 'projects']
};

const StandardQuestionsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      options: {
        type: 'array',
        items: { type: 'string' },
        minItems: 4,
        maxItems: 4
      },
      correct_answer: {
        type: 'string',
        enum: ['A', 'B', 'C', 'D'],
        description: 'The option identifier (A, B, C, or D)'
      }
    },
    required: ['question', 'options', 'correct_answer']
  }
};

const VerificationQuestionsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      options: {
        type: 'array',
        items: { type: 'string' },
        minItems: 4,
        maxItems: 4
      },
      correct_answer: {
        type: 'string',
        enum: ['A', 'B', 'C', 'D'],
        description: 'The option identifier (A, B, C, or D)'
      },
      resumeClaim: { type: 'string' }
    },
    required: ['question', 'options', 'correct_answer', 'resumeClaim']
  }
};

// Initialize Ollama client
const getOllamaClient = () => {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  // Remove /api suffix as Ollama client adds its own paths
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
function parseJSONResponse<T>(response: string): T {
  try {
    // First, try to parse as-is (in case it's already pure JSON)
    try {
      return JSON.parse(response) as T;
    } catch {
      // Not pure JSON, continue with extraction
    }

    // Extract JSON from markdown code blocks
    const jsonBlockMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonBlockMatch) {
      return JSON.parse(jsonBlockMatch[1]) as T;
    }

    // Try to find any JSON object in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }

    // Remove markdown code blocks and try again
    const cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(`Invalid JSON response from Ollama API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract structured requirements from a Job Description text
 */
export async function extractJDRequirements(rawText: string): Promise<JDRequirements> {
  const ollama = getOllamaClient();

  const prompt = `You are an expert HR analyst. Extract structured information from the following job description and return ONLY valid JSON.

Job Description:
${rawText}

Extract and return a JSON object with these fields:
- job_title: string
- department: string (or empty string if not mentioned)
- required_skills: array of strings
- preferred_skills: array of strings (or empty array if none)
- experience: object with min_years and max_years as numbers
- responsibilities: array of strings
- qualifications: array of strings

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no tables. Just pure JSON.`;

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt,
      format: JDRequirementsSchema,
      stream: false,
    });

    console.log('📥 Raw Ollama Response for JD Requirements:');
    console.log('─'.repeat(80));
    console.log(response.response);
    console.log('─'.repeat(80));

    return parseJSONResponse<JDRequirements>(response.response);
  });
}

/**
 * Extract structured profile from a Resume text
 * Focus on projects and technologies used in projects
 */
export async function extractResumeProfile(rawText: string): Promise<ResumeProfile> {
  const ollama = getOllamaClient();

  const prompt = `You are an expert resume parser. Extract structured information from the following resume and return ONLY valid JSON.

Resume:
${rawText}

Extract and return a JSON object with these fields:
- name: string (or empty string if not found)
- email: string (or empty string if not found)
- skills: array of strings
- experience_years: number (estimate based on work history)
- projects: array of objects, each with: name (string), description (string), technologies (array of strings), role (string, optional), duration (string, optional)
- education: array of strings
- certifications: array of strings (or empty array if none)

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no tables. Just pure JSON.`;

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt,
      format: ResumeProfileSchema,
      stream: false,
    });

    console.log('📥 Raw Ollama Response for Resume Profile:');
    console.log('─'.repeat(80));
    console.log(response.response);
    console.log('─'.repeat(80));

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

  const prompt = `You are an expert technical interviewer. Generate EXACTLY ${count} multiple-choice questions and return ONLY valid JSON.

Job Title: ${requirements.job_title}
Required Skills: ${requirements.required_skills.join(', ')}
Responsibilities: ${requirements.responsibilities.join(', ')}

Return a JSON array of ${count} question objects. Each object must have:
- question: string (the question text)
- options: array of exactly 4 strings (the answer choices)
- correct_answer: string (one of "A", "B", "C", or "D")

Questions should:
1. Test DEPTH of knowledge in required skills
2. Be practical and scenario-based
3. Focus on the most important required skills

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation. Just pure JSON.`;

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt,
      format: StandardQuestionsSchema,
      stream: false,
    });

    console.log('📥 Raw Ollama Response for Standard Questions:');
    console.log('─'.repeat(80));
    console.log(response.response);
    console.log('─'.repeat(80));

    const questions = parseJSONResponse<Array<{
      question: string;
      options: string[] | Record<string, string>;
      correct_answer: string;
    }>>(response.response);

    // Transform to Question type with unique IDs and correct_index
    return questions.map((q, idx) => {
      // Convert A/B/C/D to index 0/1/2/3
      const answerMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correct_index = answerMap[q.correct_answer] ?? 0;

      // Handle options as either array or object {A: "...", B: "...", ...}
      let options: string[];
      if (Array.isArray(q.options)) {
        options = q.options;
      } else {
        // Convert object to array in A, B, C, D order
        const optionsObj = q.options as Record<string, string>;
        options = ['A', 'B', 'C', 'D'].map(key => optionsObj[key] || '');
      }

      return {
        id: `std_${Date.now()}_${idx}`,
        type: 'STANDARD' as const,
        question: q.question,
        options,
        correct_answer: q.correct_answer,
        correct_index,
      };
    });
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

  const projectsInfo = profile.projects
    .map(
      (p, idx) =>
        `Project ${idx + 1}: ${p.name}
   Technologies: ${p.technologies.join(', ')}
   Description: ${p.description}`
    )
    .join('\n\n');

  const prompt = `You are an expert technical interviewer. Based on the candidate's project experience below, generate EXACTLY ${count} multiple-choice questions that INDIRECTLY verify their hands-on knowledge.

Candidate's Projects:
${projectsInfo}

CRITICAL RULES:
1. DO NOT reference the candidate's resume, projects, or any specific work in the question text
2. DO NOT use phrases like "In your project", "You mentioned", "You claimed", "In the X project"
3. Frame questions as generic technical scenarios that happen to align with technologies they used
4. The candidate should NOT be able to tell the question is based on their resume

Example of what NOT to do:
"In the E-commerce Platform you built with Redis, how would you invalidate cache?"

Example of what TO do:
"In a high-traffic e-commerce system using Redis for caching, which approach correctly invalidates product cache entries after a price update in the primary database?"

Return a JSON array of ${count} question objects. Each object must have:
- question: string (a GENERIC technical scenario question that indirectly tests their claimed experience)
- options: array of exactly 4 strings (the answer choices)
- correct_answer: string (one of "A", "B", "C", or "D")
- resumeClaim: string (INTERNAL USE ONLY - which project/technology claim you're verifying, e.g., "Claimed Redis caching experience in E-commerce Platform project")

Questions should:
1. Test DEPTH of practical implementation knowledge in the technologies they used
2. Be framed as realistic technical scenarios (not resume references)
3. Focus on specific implementation details that only someone with hands-on experience would know
4. Be indistinguishable from standard technical interview questions

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation. Just pure JSON.`;

  return withRetry(async () => {
    const response = await ollama.generate({
      model: MODEL,
      prompt,
      format: VerificationQuestionsSchema,
      stream: false,
    });

    console.log('📥 Raw Ollama Response for Verification Questions:');
    console.log('─'.repeat(80));
    console.log(response.response);
    console.log('─'.repeat(80));

    const questions = parseJSONResponse<Array<{
      question: string;
      options: string[] | Record<string, string>;
      correct_answer: string;
      resumeClaim: string;
    }>>(response.response);

    // Transform to Question type with unique IDs and correct_index
    return questions.map((q, idx) => {
      // Convert A/B/C/D to index 0/1/2/3
      const answerMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correct_index = answerMap[q.correct_answer] ?? 0;

      // Handle options as either array or object {A: "...", B: "...", ...}
      let options: string[];
      if (Array.isArray(q.options)) {
        options = q.options;
      } else {
        // Convert object to array in A, B, C, D order
        const optionsObj = q.options as Record<string, string>;
        options = ['A', 'B', 'C', 'D'].map(key => optionsObj[key] || '');
      }

      return {
        id: `ver_${Date.now()}_${idx}`,
        type: 'RESUME_VERIFICATION' as const,
        question: q.question,
        options,
        correct_answer: q.correct_answer,
        correct_index,
        resumeClaim: q.resumeClaim,
      };
    });
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
