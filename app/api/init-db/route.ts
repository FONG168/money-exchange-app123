import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// GET: Return status of database initialization
export async function GET(req: NextRequest) {
  try {
    // Test if tables exist by trying to query them
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      success: true, 
      message: 'Database is initialized',
      userCount 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database not initialized or connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Initializing database schema...');
    
    // This will create tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "firstName" TEXT,
        "lastName" TEXT,
        "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "completedTasks" INTEGER NOT NULL DEFAULT 0,
        "totalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "role" TEXT NOT NULL DEFAULT 'user',
        "status" TEXT NOT NULL DEFAULT 'active',
        "lastActive" TIMESTAMP(3),
        "isBanned" BOOLEAN NOT NULL DEFAULT false,
        "isFrozen" BOOLEAN NOT NULL DEFAULT false,
        "banReason" TEXT,
        "freezeReason" TEXT
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CurrencyPair" (
        "id" SERIAL PRIMARY KEY,
        "fromCurrency" TEXT NOT NULL,
        "toCurrency" TEXT NOT NULL,
        "rate" DOUBLE PRECISION NOT NULL,
        "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CounterLevel" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "requiredBalance" DOUBLE PRECISION NOT NULL,
        "maxDailyEarnings" DOUBLE PRECISION NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#3B82F6',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserCounter" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "counterLevelId" INTEGER NOT NULL,
        "dailyEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "lastEarningDate" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "fromCurrency" TEXT,
        "toCurrency" TEXT,
        "exchangeRate" DOUBLE PRECISION,
        "beforeBalance" DOUBLE PRECISION,
        "afterBalance" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Database schema initialized successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema initialized successfully' 
    });
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
