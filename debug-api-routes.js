// Debug script to test API routes on deployed app
const BASE_URL = 'https://money-exchange-app123-9.vercel.app';

async function testAPIRoutes() {
  console.log('🔍 Testing API Routes on Deployed App');
  console.log('=========================================\n');

  // Test 1: Admin API
  console.log('📝 Testing /api/admin');
  try {
    const adminResponse = await fetch(`${BASE_URL}/api/admin`);
    console.log('Status:', adminResponse.status);
    console.log('Status Text:', adminResponse.statusText);
    console.log('Headers:', [...adminResponse.headers.entries()]);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin API Success:');
      console.log('- Success:', adminData.success);
      console.log('- Users count:', adminData.users?.length || 0);
      console.log('- First user:', adminData.users?.[0] ? {
        id: adminData.users[0].id,
        email: adminData.users[0].email,
        firstName: adminData.users[0].firstName
      } : 'No users');
    } else {
      console.log('❌ Admin API Failed');
      const errorText = await adminResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Admin API Error:', error);
  }

  console.log('\n📝 Testing /api/currency');
  try {
    const currencyResponse = await fetch(`${BASE_URL}/api/currency?from=USD`);
    console.log('Status:', currencyResponse.status);
    console.log('Status Text:', currencyResponse.statusText);
    
    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json();
      console.log('✅ Currency API Success:');
      console.log('- Success:', currencyData.success);
      console.log('- Rates available:', Object.keys(currencyData.rates || {}).length);
    } else {
      console.log('❌ Currency API Failed');
      const errorText = await currencyResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Currency API Error:', error);
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

  console.log('\n📝 Testing /api/auth (GET)');
  try {
    const authResponse = await fetch(`${BASE_URL}/api/auth`);
    console.log('Status:', authResponse.status);
    console.log('Status Text:', authResponse.statusText);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth API Success:');
      console.log('- Users found:', authData.length);
    } else {
      console.log('❌ Auth API Failed');
      const errorText = await authResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Auth API Error:', error);
  }

  console.log('\n🏁 Testing Complete');
}

testAPIRoutes();