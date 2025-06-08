import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// Store the interval ID globally to manage the scheduler
let dailyResetInterval: NodeJS.Timeout | null = null;

// Helper to broadcast real-time updates
async function broadcastRealtimeUpdate(type: string, payload: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004'}/api/realtime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, timestamp: Date.now() }),
    });
  } catch (error) {
    console.error('Failed to broadcast realtime update:', error);
  }
}

// Perform automatic daily reset
async function performDailyReset() {
  try {
    console.log('🔄 Performing automatic daily reset...');
    
    // Reset all users' daily task data
    const taskResetResult = await prisma.userCounter.updateMany({
      data: {
        dailyCompletedOrders: 0,
        lastOrderResetDate: new Date().toISOString().split('T')[0] // Today's date
      }
    });

    // Reset commission earnings - Note: We don't reset totalEarnings in automatic reset
    // Only reset the daily tracking by updating lastOrderResetDate
    
    // Fetch updated users for real-time broadcast
    const users = await prisma.user.findMany({
      include: {
        counters: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
      orderBy: { id: 'asc' },
      take: 100,
    });

    // Broadcast automatic reset update
    await broadcastRealtimeUpdate('automatic_daily_reset', {
      message: 'Daily tasks have been automatically reset for all users',
      affectedUsers: taskResetResult.count,
      resetTime: new Date().toISOString(),
      resetType: 'automatic_daily'
    });
    
    await broadcastRealtimeUpdate('user', users);

    console.log(`✅ Automatic daily reset completed. Reset ${taskResetResult.count} user counters.`);
    
    return {
      success: true,
      message: `Automatic daily reset completed`,
      affectedUsers: taskResetResult.count,
      resetTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to perform automatic daily reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Calculate milliseconds until next midnight
function getMillisecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// Start the daily reset scheduler
function startDailyResetScheduler() {
  // Clear any existing interval
  if (dailyResetInterval) {
    clearInterval(dailyResetInterval);
  }

  // Calculate time until next midnight
  const msUntilMidnight = getMillisecondsUntilMidnight();
  
  console.log(`🕒 Daily reset scheduler starting. Next reset in ${Math.round(msUntilMidnight / 1000 / 60)} minutes.`);

  // Set timeout for first reset at midnight
  setTimeout(() => {
    // Perform the first reset
    performDailyReset().catch(console.error);
    
    // Then set up daily interval (24 hours = 24 * 60 * 60 * 1000 ms)
    dailyResetInterval = setInterval(() => {
      performDailyReset().catch(console.error);
    }, 24 * 60 * 60 * 1000);
    
  }, msUntilMidnight);
}

// Stop the daily reset scheduler
function stopDailyResetScheduler() {
  if (dailyResetInterval) {
    clearInterval(dailyResetInterval);
    dailyResetInterval = null;
    console.log('🛑 Daily reset scheduler stopped.');
  }
}

// GET: Get scheduler status
export async function GET() {
  try {
    const isRunning = dailyResetInterval !== null;
    const nextResetTime = new Date();
    nextResetTime.setDate(nextResetTime.getDate() + 1);
    nextResetTime.setHours(0, 0, 0, 0);
    
    return NextResponse.json({
      success: true,
      schedulerRunning: isRunning,
      nextResetTime: nextResetTime.toISOString(),
      currentTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get scheduler status' 
    }, { status: 500 });
  }
}

// POST: Control the daily reset scheduler
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    switch (action) {
      case 'start':
        startDailyResetScheduler();
        return NextResponse.json({ 
          success: true, 
          message: 'Daily reset scheduler started',
          nextResetTime: new Date().setDate(new Date().getDate() + 1)
        });
        
      case 'stop':
        stopDailyResetScheduler();
        return NextResponse.json({ 
          success: true, 
          message: 'Daily reset scheduler stopped' 
        });      case 'trigger':
        // Manually trigger a reset for testing
        const result = await performDailyReset();
        return NextResponse.json(result);
        
      case 'status':
        const isRunning = dailyResetInterval !== null;
        return NextResponse.json({
          success: true,
          schedulerRunning: isRunning,
          message: isRunning ? 'Scheduler is running' : 'Scheduler is stopped'
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: start, stop, trigger, or status' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Daily reset scheduler error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to control daily reset scheduler' 
    }, { status: 500 });
  }
}

// Auto-start the scheduler when the module loads
if (typeof window === 'undefined') {
  // Only run on server-side
  console.log('🚀 Initializing automatic daily reset scheduler...');
  startDailyResetScheduler();
}
