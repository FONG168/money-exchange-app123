// Test script to reproduce the data leakage issue
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3003';

async function testDataLeakage() {
  console.log('🔍 TESTING DATA LEAKAGE BETWEEN USER ACCOUNTS');
  console.log('=============================================\n');

  // Test 1: Register a completely new user
  const newUserEmail = `test-${Date.now()}@gmail.com`;
  const newUserData = {
    action: 'register',
    email: newUserEmail,
    password: 'TestPassword123',
    firstName: 'New',
    lastName: 'User',
    agreeToTerms: true
  };

  console.log('📝 Step 1: Registering new user');
  console.log(`Email: ${newUserEmail}`);

  try {
    // Test server connectivity first
    console.log('Testing server connectivity...');
    const healthCheck = await fetch(`${BASE_URL}/api/currency?from=USD`, {
      method: 'GET',
      timeout: 5000
    });
    console.log('Server is reachable:', healthCheck.ok ? '✅' : '❌');

    const registerResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserData),
      timeout: 10000
    });

    const registerResult = await registerResponse.json();
    console.log('Registration result:', registerResult);

    if (!registerResult.success) {
      console.error('❌ Registration failed:', registerResult.message);
      return;
    }

    const newUserId = registerResult.user.id;
    console.log(`✅ New user registered with ID: ${newUserId}`);

    // Test 2: Immediately check what data this new user has
    console.log('\n📥 Step 2: Checking new user data immediately after registration');
    
    const syncResponse = await fetch(`${BASE_URL}/api/user/sync`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': newUserId
      },
      timeout: 10000
    });

    const syncData = await syncResponse.json();
    console.log('\nNew user data from server:');
    console.log(`- User ID: ${syncData.user?.id}`);
    console.log(`- Email: ${syncData.user?.email}`);
    console.log(`- Total Balance: $${syncData.user?.totalBalance || 0}`);
    console.log(`- Counters: ${syncData.counters?.length || 0}`);
    console.log(`- Transactions: ${syncData.transactions?.length || 0}`);

    // Check if there are any non-zero balances or existing transactions
    const hasNonZeroBalances = syncData.counters?.some(c => c.balance > 0) || false;
    const hasTransactions = (syncData.transactions?.length || 0) > 0;
    const hasTotalBalance = (syncData.user?.totalBalance || 0) > 0;

    console.log('\n🔍 DATA LEAKAGE ANALYSIS:');
    console.log('=========================');
    console.log(`❯ New user has total balance: ${hasTotalBalance} ($${syncData.user?.totalBalance || 0})`);
    console.log(`❯ New user has counter balances: ${hasNonZeroBalances}`);
    console.log(`❯ New user has transactions: ${hasTransactions}`);

    if (hasTotalBalance || hasNonZeroBalances || hasTransactions) {
      console.log('\n🚨 CRITICAL ISSUE DETECTED!');
      console.log('A brand new user account has existing financial data.');
      console.log('This indicates severe data leakage between user accounts!');
    } else {
      console.log('\n✅ NEW USER DATA IS CLEAN');
      console.log('No data leakage detected at the server level.');
      console.log('The issue must be client-side localStorage contamination.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running on http://localhost:3003');
    }
  }
}

// Run the test
testDataLeakage();
