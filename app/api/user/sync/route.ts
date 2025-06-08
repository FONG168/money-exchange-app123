import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// GET: Fetch user data
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('X-User-ID');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        counters: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 100 // Limit to last 100 transactions
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure all counters exist for this user (create empty ones if they don't exist)
    const existingCounters = user.counters || [];
    const existingCounterIds = existingCounters.map(c => c.counterId);
    
    // Create missing counter records for counters 1-6
    for (let counterId = 1; counterId <= 6; counterId++) {
      if (!existingCounterIds.includes(counterId)) {
        console.log(`Creating empty counter ${counterId} for user ${userId}`);
        await prisma.userCounter.create({
          data: {
            userId: parseInt(userId),
            counterId: counterId,
            balance: 0,
            totalEarnings: 0,
            completedTasks: 0,
            dailyCompletedOrders: 0,
            lastActivityDate: new Date().toISOString(),
            lastOrderResetDate: new Date().toDateString(),
            isActive: false,
            canWithdraw: false,
          }
        });
      }
    }

    // Fetch updated user data with all counters
    const updatedUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        counters: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });    // Transform the data to match the expected format
    const responseData = {
      success: true,
      user: {
        id: updatedUser!.id.toString(),
        email: updatedUser!.email,
        firstName: updatedUser!.firstName || '',
        lastName: updatedUser!.lastName || '',
        totalBalance: updatedUser!.totalBalance,
        joinDate: updatedUser!.joinDate?.toISOString() || new Date().toISOString(),
        banned: updatedUser!.banned, // <-- add this
        frozen: updatedUser!.frozen, // <-- add this
      },
      counters: updatedUser!.counters || [],
      transactions: updatedUser!.transactions.map(tx => ({
        id: tx.id.toString(),
        type: tx.type,
        counterId: tx.counterId,
        amount: tx.amount,
        currency: 'USD', // Default currency since not in schema
        fromCurrency: null, // Not in schema
        toCurrency: null, // Not in schema  
        exchangeRate: null, // Not in schema
        commission: null, // Not in schema
        description: tx.description,
        createdAt: tx.createdAt.toISOString(),
      }))
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Save user data
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('X-User-ID');
    const { user: userData, counters, transactions } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user data
    if (userData) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          totalBalance: userData.totalBalance || 0,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }
      });
    }

    // Update or create counters
    if (counters) {
      for (const [counterId, counterData] of Object.entries(counters)) {
        const data = counterData as any;
        await prisma.userCounter.upsert({
          where: {
            userId_counterId: {
              userId: parseInt(userId),
              counterId: parseInt(counterId)
            }
          },
          update: {
            balance: data.balance || 0,
            totalEarnings: data.totalEarnings || 0,
            completedTasks: data.completedTasks || 0,
            dailyCompletedOrders: data.dailyCompletedOrders || 0,
            lastActivityDate: data.lastActivityDate || new Date().toISOString(),
            lastOrderResetDate: data.lastOrderResetDate || new Date().toDateString(),
            isActive: data.isActive || false,
            canWithdraw: data.canWithdraw || false,
          },
          create: {
            userId: parseInt(userId),
            counterId: parseInt(counterId),
            balance: data.balance || 0,
            totalEarnings: data.totalEarnings || 0,
            completedTasks: data.completedTasks || 0,
            dailyCompletedOrders: data.dailyCompletedOrders || 0,
            lastActivityDate: data.lastActivityDate || new Date().toISOString(),
            lastOrderResetDate: data.lastOrderResetDate || new Date().toDateString(),
            isActive: data.isActive || false,
            canWithdraw: data.canWithdraw || false,
          }
        });
      }
    }    // Save transactions
    if (transactions && Array.isArray(transactions)) {
      for (const transaction of transactions) {
        // Always check if a transaction with this ID already exists to prevent re-inserting
        // transactions that were deleted by admin resets (regardless of transaction date)
        const exists = await prisma.transaction.findUnique({ where: { id: transaction.id } });
        if (exists) continue; // Don't re-insert transactions that already exist
        
        const createdAt = transaction.timestamp ? new Date(transaction.timestamp) : new Date();
        try {
          await prisma.transaction.upsert({
            where: { id: transaction.id },
            update: {}, // Don't update existing transactions
            create: {
              id: transaction.id,
              userId: parseInt(userId),
              type: transaction.type,
              counterId: transaction.counterId || null,
              amount: transaction.amount,
              timestamp: transaction.timestamp || new Date().toISOString(),
              status: 'completed',
              description: transaction.description,
              createdAt: createdAt,
            }
          });
        } catch (error) {
          console.warn(`Failed to save transaction ${transaction.id}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
