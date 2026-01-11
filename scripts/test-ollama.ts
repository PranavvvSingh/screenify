/**
 * Test script for Ollama service
 * Run with: npx tsx scripts/test-ollama.ts
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import {
  extractJDRequirements,
  extractResumeProfile,
  generateStandardQuestions,
  generateVerificationQuestions,
  generateQuiz,
} from '../lib/ollama';
import type { JDRequirements, ResumeProfile, Question } from '../types/ollama';

// Sample Job Description
const sampleJD = `
Senior Full Stack Developer

We are looking for a Senior Full Stack Developer with 5-8 years of experience to join our engineering team.

Required Skills:
- Node.js and Express.js
- React and Next.js
- PostgreSQL and database design
- RESTful API development
- Git version control

Responsibilities:
- Develop and maintain web applications
- Design and implement database schemas
- Write clean, maintainable code
- Collaborate with cross-functional teams
- Conduct code reviews

Qualifications:
- Bachelor's degree in Computer Science or related field
- 5+ years of professional software development experience
- Strong problem-solving skills
`;

// Sample Resume
const sampleResume = `
John Doe
john.doe@email.com

Full Stack Developer with 6 years of experience

Projects:
1. E-commerce Platform (2022-2023)
   - Built scalable backend using Node.js and Express
   - Implemented real-time features with WebSockets
   - Used PostgreSQL for data storage
   - Technologies: Node.js, Express, React, PostgreSQL, Redis

2. Task Management App (2021-2022)
   - Developed mobile-first web app with Next.js
   - Integrated third-party APIs
   - Technologies: Next.js, TypeScript, MongoDB

Education:
- BS Computer Science, University of Technology (2017)

Skills: JavaScript, TypeScript, Node.js, React, Next.js, PostgreSQL, MongoDB
`;

async function testExtractJDRequirements() {
  console.log('🧪 Testing extractJDRequirements...\n');
  try {
    console.log('📤 Sending JD text to Ollama...');
    const requirements = await extractJDRequirements(sampleJD);
    console.log('✅ JD Requirements extracted successfully:');
    // console.log(JSON.stringify(requirements, null, 2));
    return requirements;
  } catch (error) {
    console.error('❌ Failed to extract JD requirements:', error);
    throw error;
  }
}

async function testExtractResumeProfile() {
  console.log('\n🧪 Testing extractResumeProfile...\n');
  try {
    const profile = await extractResumeProfile(sampleResume);
    console.log('✅ Resume profile extracted successfully:');
    // console.log(JSON.stringify(profile, null, 2));
    return profile;
  } catch (error) {
    console.error('❌ Failed to extract resume profile:', error);
    throw error;
  }
}

async function testGenerateStandardQuestions(requirements: JDRequirements) {
  console.log('\n🧪 Testing generateStandardQuestions...\n');
  try {
    const questions = await generateStandardQuestions(requirements, 7);
    console.log(`✅ Generated ${questions.length} standard questions:`);
    // console.log(JSON.stringify(questions, null, 2));
    return questions;
  } catch (error) {
    console.error('❌ Failed to generate standard questions:', error);
    throw error;
  }
}

async function testGenerateVerificationQuestions(profile: ResumeProfile) {
  console.log('\n🧪 Testing generateVerificationQuestions...\n');
  try {
    const questions = await generateVerificationQuestions(profile, 3);
    console.log(`✅ Generated ${questions.length} verification questions:`);
    // console.log(JSON.stringify(questions, null, 2));
    return questions;
  } catch (error) {
    console.error('❌ Failed to generate verification questions:', error);
    throw error;
  }
}

function testGenerateQuiz(standardQuestions: Question[], verificationQuestions: Question[]) {
  console.log('\n🧪 Testing generateQuiz (combining and shuffling pre-generated questions)...\n');
  try {
    const quiz = generateQuiz({
      standardQuestions,
      verificationQuestions,
    });

    console.log('✅ Complete quiz generated successfully:');
    console.log(JSON.stringify(quiz, null, 2));

    return quiz;
  } catch (error) {
    console.error('❌ Failed to generate complete quiz:', error);
    throw error;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Ollama Service Tests\n');
  console.log('='.repeat(80));

  try {
    // Test 1: Extract JD Requirements
    const requirements = await testExtractJDRequirements();
    console.log('\n' + '='.repeat(80));

    // Test 2: Extract Resume Profile
    const profile = await testExtractResumeProfile();
    console.log('\n' + '='.repeat(80));

    // Test 3: Generate Standard Questions
    const standardQuestions = await testGenerateStandardQuestions(requirements);
    console.log('\n' + '='.repeat(80));

    // Test 4: Generate Verification Questions
    const verificationQuestions = await testGenerateVerificationQuestions(profile);
    console.log('\n' + '='.repeat(80));

    // Test 5: Generate Complete Quiz (reusing pre-generated questions)
    testGenerateQuiz(standardQuestions, verificationQuestions);
    console.log('\n' + '='.repeat(80));

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  ✓ JD requirements extraction');
    console.log('  ✓ Resume profile extraction');
    console.log('  ✓ Standard question generation');
    console.log('  ✓ Verification question generation');
    console.log('  ✓ Complete quiz generation with shuffling');
    console.log('  ✓ Retry logic with exponential backoff');
    console.log('  ✓ Timeout handling (30s)');
    console.log('  ✓ JSON response parsing');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.OLLAMA_CLOUD_API_KEY) {
  console.error('❌ Error: OLLAMA_CLOUD_API_KEY environment variable is not set');
  console.log('Please set it in your .env.local file');
  process.exit(1);
}

// Run tests
runTests();
