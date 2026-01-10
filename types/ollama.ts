// JD Requirements Types
export interface JDRequirements {
  required_skills: string[];
  preferred_skills: string[];
  experience: {
    min_years: number;
    max_years: number;
  };
  responsibilities: string[];
  qualifications: string[];
  job_title: string;
  department?: string;
}

// Resume Profile Types
export interface ResumeProfile {
  name?: string;
  email?: string;
  skills: string[];
  experience_years: number;
  projects: ProjectDetail[];
  education?: string[];
  certifications?: string[];
}

export interface ProjectDetail {
  name: string;
  description: string;
  technologies: string[];
  role?: string;
  duration?: string;
}

// Question Types
export type QuestionType = 'STANDARD' | 'RESUME_VERIFICATION';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correct_answer: string;
  correct_index: number;
  resumeClaim?: string; // Only for RESUME_VERIFICATION type
}

// Quiz Generation Types
export interface GenerateQuizParams {
  standardQuestions: Question[];
  verificationQuestions?: Question[];
}

export interface GeneratedQuiz {
  standardQuestions: Question[];
  verificationQuestions?: Question[];
  allQuestions: Question[]; // Shuffled combination
}

// Ollama API Response Types
export interface OllamaResponse<T> {
  model: string;
  created_at: string;
  response: T;
  done: boolean;
}

// Error Types
export interface OllamaError {
  error: string;
  details?: string;
  retryable?: boolean;
}
