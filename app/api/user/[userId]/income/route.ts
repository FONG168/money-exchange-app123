import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get user's daily income data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        counters: {
          select: {
            counterId: true,
            balance: true,
            totalEarnings: true,
            dailyCompletedOrders: true,
            lastOrderResetDate: true,
            isActive: true
          }
        },
        transactions: {
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow
            },
            status: {
              in: ['approved', 'completed']
            }
          },
          select: {
            id: true,
            type: true,
            amount: true,
            counterId: true,
            description: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }    // Calculate daily income - only from completed commission transactions
    const dailyIncome = {
      totalIncome: 0,
      commission: 0,
      completedOrders: 0,
      deposit: 0,
      exchange: 0,
      withdrawal: 0,
      other: 0
    };

    // Process today's transactions - only count commission as income
    user.transactions.forEach(transaction => {
      const amount = transaction.amount;
      
      switch (transaction.type) {
        case 'commission':
          // Only commission transactions count as daily income
          dailyIncome.commission += amount;
          dailyIncome.totalIncome += amount;
          dailyIncome.completedOrders += 1; // Count completed orders
          break;
        case 'deposit':
          dailyIncome.deposit += amount;
          // Deposits are not counted as income
          break;
        case 'exchange':
          dailyIncome.exchange += amount;
          // Exchange transactions are not counted as income
          break;
        case 'withdrawal':
        case 'commission_withdrawal':
          dailyIncome.withdrawal += amount; // This will be negative for outgoing
          // Withdrawals are not counted as income
          break;
        default:
          dailyIncome.other += amount;
          // Other transactions are not counted as income
          break;
      }
    });    // Get counter-specific data
    const counterIncome = user.counters.map(counter => ({
      counterId: counter.counterId,
      currentBalance: counter.balance,
      totalEarnings: counter.totalEarnings,
      dailyCompletedOrders: counter.dailyCompletedOrders,
      isActive: counter.isActive,
      // Calculate today's earnings from this counter - only commission transactions
      todaysEarnings: user.transactions
        .filter(t => t.counterId === counter.counterId && t.type === 'commission')
        .reduce((sum, t) => sum + t.amount, 0),
      // Count today's completed orders for this counter
      todaysCompletedOrders: user.transactions
        .filter(t => t.counterId === counter.counterId && t.type === 'commission')
        .length
    }));

    // Calculate total daily earnings from all active counters (only commission)
    const totalDailyEarnings = counterIncome.reduce((sum, counter) => 
      sum + counter.todaysEarnings, 0
    );

    return NextResponse.json({
      success: true,
      date: today.toISOString().split('T')[0],
      dailyIncome,
      totalDailyEarnings,
      counterIncome,
      transactions: user.transactions,
      summary: {
        activeCounters: user.counters.filter(c => c.isActive).length,
        totalCounters: user.counters.length,
        totalTransactionsToday: user.transactions.length
      }
    });

  } catch (error) {
    console.error('Error fetching daily income:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch daily income data' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
