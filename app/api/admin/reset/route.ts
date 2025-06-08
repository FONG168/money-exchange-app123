import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

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

// POST: Handle reset operations
export async function POST(req: NextRequest) {
  try {
    const { resetType, userId } = await req.json();

    switch (resetType) {
      case 'dailyTasks':
        return await resetDailyTasks(userId);
      case 'commissions':
        return await resetCommissions(userId);
      case 'exchangeTransactions':
        return await resetExchangeTransactions(userId);
      case 'all':
        return await resetAll(userId);
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid reset type' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Reset operation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to perform reset operation' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Reset daily completed orders/tasks
async function resetDailyTasks(userId?: number) {
  try {
    const whereClause = userId ? { userId: userId } : {};
    
    // Reset all task-related fields for specified user or all users
    const result = await prisma.userCounter.updateMany({
      where: whereClause,
      data: {
        dailyCompletedOrders: 0,
        completedTasks: 0,
        cumulativeCompletedTasks: 0,
        lastOrderResetDate: new Date().toISOString().split('T')[0] // Today's date
      }
    });

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
    });    // Broadcast update
    const userInfo = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    const targetMessage = userId 
      ? `Reset daily tasks for user ${userInfo?.firstName} ${userInfo?.lastName} (ID: ${userId})`
      : 'Daily tasks have been reset for all users';

    await broadcastRealtimeUpdate('admin_reset_daily_tasks', {
      message: targetMessage,
      affectedUsers: result.count,
      userId: userId || null
    });
    await broadcastRealtimeUpdate('user', users);    return NextResponse.json({ 
      success: true, 
      message: `${targetMessage} - ${result.count} user counters affected`,
      affectedCount: result.count
    });
  } catch (error) {
    console.error('Failed to reset daily tasks:', error);
    throw error;
  }
}

// Reset commission earnings
async function resetCommissions(userId?: number) {
  try {
    const whereClause = userId ? { userId: userId } : {};
    
    // Reset totalEarnings for specified user or all users
    const result = await prisma.userCounter.updateMany({
      where: whereClause,
      data: {
        totalEarnings: 0
      }
    });

    // Delete commission transactions for specified user or all users
    const transactionWhereClause = userId 
      ? { userId: userId, type: { in: ['commission', 'commission_withdrawal'] } }
      : { type: { in: ['commission', 'commission_withdrawal'] } };
      
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: transactionWhereClause
    });

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
    });    // Broadcast update
    const userInfo = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    const targetMessage = userId 
      ? `Reset commissions for user ${userInfo?.firstName} ${userInfo?.lastName} (ID: ${userId})`
      : 'Commission earnings have been reset for all users';

    await broadcastRealtimeUpdate('admin_reset_commissions', {
      message: targetMessage,
      affectedUsers: result.count,
      deletedTransactions: deletedTransactions.count,
      userId: userId || null
    });
    await broadcastRealtimeUpdate('user', users);

    return NextResponse.json({ 
      success: true, 
      message: `${targetMessage} - ${result.count} user counters affected, ${deletedTransactions.count} commission transactions deleted`,
      affectedCount: result.count,
      deletedTransactions: deletedTransactions.count
    });
  } catch (error) {
    console.error('Failed to reset commissions:', error);
    throw error;
  }
}

// Reset exchange transactions
async function resetExchangeTransactions(userId?: number) {
  try {
    // Delete exchange transactions for specified user or all users
    const whereClause = userId 
      ? { userId: userId, type: 'exchange' }
      : { type: 'exchange' };
      
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: whereClause
    });

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
    });    // Broadcast update
    const userInfo = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    const targetMessage = userId 
      ? `Reset exchange transactions for user ${userInfo?.firstName} ${userInfo?.lastName} (ID: ${userId})`
      : 'Exchange transactions have been reset for all users';

    await broadcastRealtimeUpdate('admin_reset_exchange_transactions', {
      message: targetMessage,
      deletedTransactions: deletedTransactions.count,
      userId: userId || null
    });
    await broadcastRealtimeUpdate('user', users);

    return NextResponse.json({ 
      success: true, 
      message: `${targetMessage} - ${deletedTransactions.count} exchange transactions deleted`,
      deletedTransactions: deletedTransactions.count
    });
  } catch (error) {
    console.error('Failed to reset exchange transactions:', error);
    throw error;
  }
}

// Reset all (daily tasks, commissions, and exchange transactions)
async function resetAll(userId?: number) {
  try {
    const whereClause = userId ? { userId: userId } : {};
    // Reset all task-related fields, dailyCompletedOrders and totalEarnings for specified user or all users
    const userCounterResult = await prisma.userCounter.updateMany({
      where: whereClause,
      data: {
        dailyCompletedOrders: 0,
        completedTasks: 0,
        cumulativeCompletedTasks: 0,
        totalEarnings: 0,
        lastOrderResetDate: new Date().toISOString().split('T')[0]
      }
    });    // Delete ONLY exchange and commission transactions for today (preserve deposits/withdrawals)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const transactionWhereClause = userId 
      ? { 
          userId: userId, 
          createdAt: { gte: today, lt: tomorrow },
          type: { in: ['exchange', 'commission', 'commission_withdrawal'] }
        }
      : { 
          createdAt: { gte: today, lt: tomorrow },
          type: { in: ['exchange', 'commission', 'commission_withdrawal'] }
        };
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: transactionWhereClause
    });

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
    });    // Broadcast update
    await broadcastRealtimeUpdate('admin_reset_all', {
      message: 'All daily tasks and today\'s exchange/commission transactions have been reset',
      affectedUsers: userCounterResult.count,
      deletedTransactions: deletedTransactions.count
    });
    await broadcastRealtimeUpdate('user', users);    return NextResponse.json({ 
      success: true, 
      message: `Complete reset: reset all tasks and deleted today's exchange/commission transactions for ${userCounterResult.count} user counters and deleted ${deletedTransactions.count} transactions`,
      affectedCount: userCounterResult.count,
      deletedTransactions: deletedTransactions.count
    });
  } catch (error) {
    console.error('Failed to reset all:', error);
    throw error;
  }
}
