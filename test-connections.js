/**
 * Simple test script to verify:
 * 1. Database connection (Prisma)
 * 2. Ollama Cloud API connection
 *
 * Run with: node test-connections.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// Disable SSL certificate validation for testing (cloud DBs with self-signed certs)
// NOTE: This is ONLY for testing. In production, use proper SSL configuration.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create PostgreSQL connection pool with SSL configuration
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for cloud-hosted databases with self-signed certs
    sslmode: 'require'
  }
});

// Test 1: Database Connection
async function testDatabaseConnection() {
  console.log('\n🔍 Testing Database Connection...');
  try {
    // Test direct pool connection first
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    client.release();

    console.log('✅ Database connection successful!');
    console.log('   Database:', result.rows[0].db_version.split(' ').slice(0, 2).join(' '));
    console.log('   Current time:', result.rows[0].current_time);

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Test 2: Ollama API Call
async function testOllamaAPI() {
  console.log('\n🔍 Testing Ollama Cloud API...');

  const apiKey = process.env.OLLAMA_CLOUD_API_KEY;
  const model = process.env.OLLAMA_CLOUD_MODEL;
  const apiUrl = process.env.OLLAMA_CLOUD_API_URL;

  if (!apiKey || !model || !apiUrl) {
    console.error('❌ Missing Ollama environment variables');
    return false;
  }

  // console.log(`   Using model: ${model}`);
  // console.log(`   API URL: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'What is node.js? ans briefly only'
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('   HTTP Error:', response.status, response.statusText);
      console.error('   Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Ollama API connection successful!');
    console.log('   Response:', data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Ollama API call failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message || error.cause);
    }
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('='.repeat(50));
  console.log('🚀 Starting Connection Tests');
  console.log('='.repeat(50));

  const dbSuccess = await testDatabaseConnection();
  const ollamaSuccess = await testOllamaAPI();

  console.log('📊 Test Results Summary');
  console.log(`Database: ${dbSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Ollama API: ${ollamaSuccess ? '✅ PASS' : '❌ FAIL'}`);

  process.exit(dbSuccess && ollamaSuccess ? 0 : 1);
}

// Run the tests
runTests();
