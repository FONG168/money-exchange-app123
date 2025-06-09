// Debug script to test API routes on deployed app
const BASE_URL = 'https://money-exchange666.vercel.app';

async function testAPIRoutes() {
  console.log('🔍 Testing API Routes on Deployed App');
  console.log('=========================================\n');

  // Test Auth API
  console.log('📝 Testing /api/auth (Login)');
  try {
    const authResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    console.log('Status:', authResponse.status);
    console.log('Status Text:', authResponse.statusText);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth API Success:', authData);
    } else {
      console.log('❌ Auth API Failed');
      const errorText = await authResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Auth API Error:', error);
  }

  // Test Admin API
  console.log('\n📝 Testing /api/admin');
  try {
    const adminResponse = await fetch(`${BASE_URL}/api/admin`);
    console.log('Status:', adminResponse.status);
    console.log('Status Text:', adminResponse.statusText);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin API Success:');
      console.log('- Success:', adminData.success);
      console.log('- Users count:', adminData.users?.length || 0);
    } else {
      console.log('❌ Admin API Failed');
      const errorText = await adminResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Admin API Error:', error);
  }

  console.log('\n📝 Testing /api/init-db');
  try {
    const initResponse = await fetch(`${BASE_URL}/api/init-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    console.log('Status:', initResponse.status);
    console.log('Status Text:', initResponse.statusText);
    
    if (initResponse.ok) {
      const initData = await initResponse.json();
      console.log('✅ Init DB Success:', initData);
    } else {
      console.log('❌ Init DB Failed');
      const errorText = await initResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Init DB Error:', error);
  }
}

// Run the test
testAPIRoutes();
