/**
 * Standalone test for generateStandardQuestions
 * Run with: npx tsx scripts/test-standard-questions.ts
 */

import { config } from 'dotenv';
config();

import { generateStandardQuestions } from '../lib/ollama';
import type { JDRequirements } from '../types/ollama';

// Sample requirements
const sampleRequirements: JDRequirements = {
  job_title: "Senior Full Stack Developer",
  department: "Engineering",
  required_skills: ["Node.js", "Express.js", "React", "Next.js", "PostgreSQL"],
  preferred_skills: ["Docker", "AWS"],
  experience: {
    min_years: 5,
    max_years: 8
  },
  responsibilities: [
    "Develop and maintain web applications",
    "Design and implement database schemas",
    "Write clean, maintainable code"
  ],
  qualifications: [
    "Bachelor's degree in Computer Science",
    "5+ years of professional software development experience"
  ]
};

async function test() {
  console.log('🧪 Testing generateStandardQuestions...\n');
  console.log('📤 Input Requirements:');
  console.log(JSON.stringify(sampleRequirements, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  try {
    const questions = await generateStandardQuestions(sampleRequirements, 3);

    console.log('\n✅ Success! Generated', questions.length, 'questions:\n');
    questions.forEach((q, idx) => {
      console.log(`Question ${idx + 1}:`);
      console.log(`  Q: ${q.question}`);
      console.log(`  Options:`, q.options);
      console.log(`  Correct: ${q.correct_answer} (index: ${q.correct_index})`);
      console.log();
    });
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

test();
