const { Client } = require('pg');
const { Resend } = require('resend');

// Load environment variables manually for verification
const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

async function testNeonDB() {
  console.log('Testing Neon Database connection...');
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment.');
    return false;
  }
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon secure connection in serverless environment
    }
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Neon Database!');
    const res = await client.query('SELECT NOW(), version();');
    console.log(`   Database version: ${res.rows[0].version}`);
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ Neon Database connection failed:', err.message);
    return false;
  }
}

async function testGemini() {
  console.log('Testing Google Gemini API key...');
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in environment.');
    return false;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Explain AI Spend Auditing in exactly 15 words.',
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
      console.log('✅ Google Gemini API key is working perfectly!');
      console.log(`   Response: ${data.candidates[0].content.parts[0].text.trim()}`);
      return true;
    } else {
      console.error('❌ Google Gemini API error:', JSON.stringify(data));
      return false;
    }
  } catch (err) {
    console.error('❌ Google Gemini API test failed:', err.message);
    return false;
  }
}

async function testResend() {
  console.log('Testing Resend API key...');
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment.');
    return false;
  }

  const resend = new Resend(RESEND_API_KEY);
  try {
    // We fetch api key details or send an email to test
    // To verify without sending a real email, let's fetch list of API keys or domain list
    const domains = await resend.domains.list();
    console.log('✅ Resend API key is working perfectly!');
    console.log(`   Domains verified in account: ${domains.data ? domains.data.length : 0}`);
    return true;
  } catch (err) {
    console.error('❌ Resend API test failed:', err.message);
    return false;
  }
}

async function runAllTests() {
  console.log('--- STARTING SpendLens API KEYS VERIFICATION ---');
  const dbOk = await testNeonDB();
  console.log('------------------------------------------------');
  const geminiOk = await testGemini();
  console.log('------------------------------------------------');
  const resendOk = await testResend();
  console.log('------------------------------------------------');
  
  if (dbOk && geminiOk && resendOk) {
    console.log('🎉 ALL API KEYS VERIFIED AND WORKING PERFECTLY IN PRODUCTION! 🎉');
  } else {
    console.warn('⚠️ SOME API KEYS ENCOUNTERED ISSUES. Please review the output above.');
  }
}

runAllTests();
