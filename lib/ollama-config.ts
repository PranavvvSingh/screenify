import type { JDRequirements, ResumeProfile } from '@/types/ollama';

// JSON Schemas for structured outputs

export const schemas = {
  jdRequirements: {
    type: 'object',
    properties: {
      job_title: { type: 'string' },
      description: {type: 'string'},
      requirements: {
        type: 'array',
        items: { type: 'string' }
      },
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
      }
    },
    required: ['job_title', 'description', 'requirements', 'required_skills', 'preferred_skills', 'experience']
  },

  resumeProfile: {
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
            role: { type: 'string' }
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
  },

  standardQuestions: {
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
          type: 'integer',
          enum: [0, 1, 2, 3],
          description: 'Index of the correct option in the options array'
        }
      },
      required: ['question', 'options', 'correct_answer']
    }
  },

  verificationQuestions: {
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
          type: 'integer',
          enum: [0, 1, 2, 3],
          description: 'Index of the correct option in the options array'
        }
      },
      required: ['question', 'options', 'correct_answer']
    }
  }
} as const;

// ============================================================================
// LLM Call Configurations (prompt + temperature + top_p per operation)
// ============================================================================

/**
 * JD Requirements Extraction Configuration
 * Very deterministic - pure data extraction, want consistency
 */
export const jdRequirementsConfig = {
  prompt: (rawText: string) => `You are an expert HR analyst. Extract structured information from the following job description and return ONLY valid JSON.

Job Description:
${rawText}

Extract and return a JSON object with these fields:
- job_title: string
- description: string (comprehensive job description including responsibilities, qualifications, and any other relevant details)
- requirements: array of strings (list of key requirements/qualifications for the role)
- department: string (or empty string if not mentioned)
- required_skills: array of strings (technical/hard skills required)
- preferred_skills: array of strings (or empty array if none)
- experience: object with min_years and max_years as numbers

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no tables. Just pure JSON.`,

  temperature: 0.1,
  top_p: 0.9,
  schema: schemas.jdRequirements,
} as const;

/**
 * Resume Profile Extraction Configuration
 * Very deterministic - pure data extraction, want consistency
 */
export const resumeProfileConfig = {
  prompt: (rawText: string) => `You are an expert resume parser. Extract structured information from the following resume and return ONLY valid JSON.

Resume:
${rawText}

Extract and return a JSON object with these fields:
- name: string (or empty string if not found)
- email: string (or empty string if not found)
- skills: array of strings
- experience_years: number (estimate based on work history)
- projects: array of objects, each with: name (string), description (string), technologies (array of strings), role (string, optional)
- education: array of strings
- certifications: array of strings (or empty array if none)

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation, no tables. Just pure JSON.`,

  temperature: 0.1,
  top_p: 0.9,
  schema: schemas.resumeProfile,
} as const;

/**
 * Standard Questions Generation Configuration
 * Low-medium temperature: consistent questions but allow practical scenario variation
 */
export const standardQuestionsConfig = {
  prompt: (requirements: JDRequirements, count: number) => `You are a senior technical interviewer. Generate EXACTLY ${count} MCQs. Return ONLY valid JSON.

Context:
- Role: ${requirements.job_title}
- Required Skills: ${requirements.required_skills.join(", ")}
- Job Description: ${requirements.description}

Output:
JSON array of ${count} objects, each with:
{
  "question": string,
  "options": [string, string, string, string],
  "correct_answer": integer // 0, 1, 2, or 3 (index of correct option in the options array)
}

Rules:
- Test deep, practical knowledge of the listed skills
- Prefer real-world, scenario-based questions
- Focus on the most important skills only
- options MUST be exactly 4 items
- options MUST contain only raw text (NO "A:", "B:", "C:", "D:" prefixes)
- correct_answer MUST be an integer: 0, 1, 2, or 3 (NOT "A", "B", "C", "D")

STRICT:
- Output ONLY the JSON array
- No markdown
- No explanation
- No extra text`,

  temperature: 0.3,
  top_p: 0.9,
  schema: schemas.standardQuestions,
} as const;

/**
 * Verification Questions Generation Configuration
 * Low-medium temperature: consistent approach but allow tailored scenarios per candidate
 */
export const verificationQuestionsConfig = {
  prompt: (profile: ResumeProfile, count: number) => {
    const projectsInfo = profile.projects
      .map(
        (p, idx) =>
          `Project ${idx + 1}: ${p.name}
   Technologies: ${p.technologies.join(', ')}
   Description: ${p.description}`
      )
      .join('\n\n');

    return `
You are a senior technical interviewer.Generate EXACTLY ${count} MCQs that INDIRECTLY verify hands-on experience.

Input (candidate project context):
${projectsInfo}

Hard rules:
- NEVER mention the candidate, resume, or projects
- No phrases like "you built", "you mentioned", "in your project"
- Questions must be generic, real-world technical scenarios (edge cases, trade-offs, failures)
- Candidate must NOT infer resume-based targeting

Output:
JSON array of ${count} objects:
{
  "question": string,
  "options": [string, string, string, string],
  "correct_answer": number // 0 | 1 | 2 | 3 (index in options)
}

Guidelines:
- Test deep, implementation-level knowledge
- Focus on edge cases, trade-offs, failure modes
- Scenarios should match technologies used, implicitly
- Questions must look like standard interview questions

Strict:
- options length = 4, raw text only (no prefixes)
- correct_answer must be 0–3
- Output ONLY the JSON array
- No markdown, no extra text`;
  },

  temperature: 0.3,
  top_p: 0.9,
  schema: schemas.verificationQuestions,
} as const;
