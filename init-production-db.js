// Production database initialization script
const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://money-exchange-app123-9.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, ok: res.statusCode < 400, json: () => jsonData, text: () => data });
        } catch {
          resolve({ status: res.statusCode, ok: res.statusCode < 400, json: () => ({}), text: () => data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function initProductionDatabase() {
  console.log('🔧 Initializing production database...');
  
  try {
    // Test if the API is accessible
    console.log('📡 Testing API accessibility...');
    const testResponse = await makeRequest(`${PRODUCTION_URL}/api/auth`);
    console.log(`API Test Status: ${testResponse.status}`);
    
    if (testResponse.status === 404) {
      console.log('❌ API routes are not deployed correctly!');
      console.log('This usually means:');
      console.log('1. The deployment failed');
      console.log('2. Environment variables are missing');
      console.log('3. Prisma client generation failed during build');
      return;
    }
    
    // Try to initialize database
    console.log('🗄️ Initializing database schema...');
    const initResponse = await makeRequest(`${PRODUCTION_URL}/api/init-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const initData = initResponse.json();
    console.log('Init response:', initData);
    
    if (initResponse.ok) {
      console.log('✅ Database initialized successfully!');
    } else {
      console.log('❌ Database initialization failed');
      console.log('Error:', initData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initProductionDatabase();