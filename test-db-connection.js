// Quick test to verify Prisma client and database schema
const { PrismaClient } = require('./app/generated/prisma');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if User table exists
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible, found ${userCount} users`);
    
    // Test if other tables exist
    const counterCount = await prisma.userCounter.count();
    console.log(`✅ UserCounter table accessible, found ${counterCount} counters`);
    
    const transactionCount = await prisma.transaction.count();
    console.log(`✅ Transaction table accessible, found ${transactionCount} transactions`);
    
    console.log('\n🎉 All database tables are working correctly!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };