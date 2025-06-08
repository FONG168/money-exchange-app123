import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to broadcast real-time updates
async function broadcastRealtimeUpdate(type: string, payload: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/realtime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    });
  } catch (error) {
    console.error('Failed to broadcast real-time update:', error);
  }
}

// POST: Create a new withdrawal request (pending)
export async function POST(req: NextRequest) {
  try {
    const { userId, counterId, amount, withdrawalMethod } = await req.json();
    if (!userId || !counterId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const userCounter = await prisma.userCounter.findUnique({
      where: { userId_counterId: { userId: parseInt(userId), counterId: parseInt(counterId) } }
    });
    if (!userCounter) {
      return NextResponse.json({ error: 'Counter not found' }, { status: 404 });
    }
    const totalAvailable = (userCounter.balance || 0) + (userCounter.totalEarnings || 0);
    if (totalAvailable < parseFloat(amount)) {
      return NextResponse.json({ error: 'Insufficient total balance' }, { status: 400 });
    }
    // Only allow one pending withdrawal per counter
    const pending = await prisma.transaction.findFirst({
      where: {
        userId: parseInt(userId),
        counterId: parseInt(counterId),
        status: 'pending',
        type: 'withdrawal',
      }
    });
    if (pending) {
      return NextResponse.json({ error: 'You already have a pending withdrawal for this counter.' }, { status: 400 });
    }
    // Create description
    const description = `Withdrawal request via ${withdrawalMethod} (Total: $${parseFloat(amount).toFixed(2)})`;
    const transaction = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        userId: parseInt(userId),
        type: 'withdrawal',
        counterId: parseInt(counterId),
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
        status: 'pending',
        description: description,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    await broadcastRealtimeUpdate('withdrawal_created', {
      transaction,
      message: `New withdrawal request from ${transaction.user.firstName} ${transaction.user.lastName}`
    });
    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET: List all withdrawal requests (for admin)
export async function GET() {
  try {
    // Fetch both withdrawal and commission_withdrawal types, so admin can see them separately
    const allWithdrawals = await prisma.transaction.findMany({
      where: { 
        type: { in: ['withdrawal', 'commission_withdrawal'] }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    return NextResponse.json({ success: true, allWithdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: Approve, deny, or freeze a withdrawal request (admin)
export async function PATCH(req: NextRequest) {
  try {
    const { transactionId, action } = await req.json();
    if (!transactionId || !['approve', 'deny', 'freeze', 'unfreeze'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const transaction = await prisma.transaction.findUnique({ 
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    if (!transaction || transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction not found or not pending' }, { status: 404 });
    }
    if (action === 'approve') {
      const userCounter = await prisma.userCounter.findUnique({
        where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } }
      });
      if (!userCounter) {
        return NextResponse.json({ error: 'Counter not found' }, { status: 404 });
      }
      let amountToDeduct = transaction.amount;
      let balance = userCounter.balance || 0;
      let commission = userCounter.totalEarnings || 0;
      if ((balance + commission) < amountToDeduct) {
        return NextResponse.json({ error: 'Insufficient total balance for withdrawal' }, { status: 400 });
      }
      // Deduct from balance first, then commission if needed
      let deductFromBalance = Math.min(balance, amountToDeduct);
      let deductFromCommission = amountToDeduct - deductFromBalance;
      // --- SAFEGUARD: Double-check before updating ---
      if (deductFromBalance > 0) {
        if (balance < deductFromBalance) {
          return NextResponse.json({ error: 'Insufficient balance for withdrawal (race condition)' }, { status: 400 });
        }
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
          data: { balance: { decrement: deductFromBalance } },
        });
        await prisma.user.update({
          where: { id: transaction.userId },
          data: { totalBalance: { decrement: deductFromBalance } },
        });
      }
      if (deductFromCommission > 0) {
        if (commission < deductFromCommission) {
          return NextResponse.json({ error: 'Insufficient commission for withdrawal (race condition)' }, { status: 400 });
        }
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
          data: { totalEarnings: { decrement: deductFromCommission } },
        });
      }
      // --- SAFEGUARD: After update, never allow negative balances ---
      const updatedUserCounter = await prisma.userCounter.findUnique({
        where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } }
      });
      if (updatedUserCounter) {
        let fixNeeded = false;
        let fixData: any = {};
        if (updatedUserCounter.balance < 0) {
          fixNeeded = true;
          fixData.balance = 0;
        }
        if (updatedUserCounter.totalEarnings < 0) {
          fixNeeded = true;
          fixData.totalEarnings = 0;
        }
        if (fixNeeded) {
          await prisma.userCounter.update({
            where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
            data: fixData
          });
        }
      }
      const updatedTransaction = await prisma.transaction.update({ 
        where: { id: transactionId }, 
        data: { 
          status: 'approved',
          description: `${transaction.description} - Success`
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      await broadcastRealtimeUpdate('withdrawal_approved', {
        transaction: updatedTransaction,
        message: `Withdrawal approved for ${transaction.user.firstName} ${transaction.user.lastName}`,
        userId: transaction.userId
      });
    } else if (action === 'deny') {
      // Update transaction status and description to include Denied (no balance changes for denied)
      const updatedTransaction = await prisma.transaction.update({ 
        where: { id: transactionId }, 
        data: { 
          status: 'denied',
          description: `${transaction.description} - Denied`
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });        // Broadcast real-time update for denied withdrawal
      const eventType = transaction.type === 'commission_withdrawal' ? 'commission_withdrawal_denied' : 'withdrawal_denied';
      await broadcastRealtimeUpdate(eventType, {
        transaction: updatedTransaction,        message: `${transaction.type === 'commission_withwithdrawal' ? 'Commission w' : 'W'}ithdrawal denied for ${transaction.user.firstName} ${transaction.user.lastName}`,
        userId: transaction.userId
      });
    } else if (action === 'freeze') {
      // Update transaction status to frozen
      const updatedTransaction = await prisma.transaction.update({ 
        where: { id: transactionId }, 
        data: { 
          status: 'frozen',
          description: `${transaction.description} - Frozen`
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Broadcast real-time update for frozen withdrawal
      const eventType = transaction.type === 'commission_withdrawal' ? 'commission_withdrawal_frozen' : 'withdrawal_frozen';
      await broadcastRealtimeUpdate(eventType, {
        transaction: updatedTransaction,
        message: `${transaction.type === 'commission_withdrawal' ? 'Commission w' : 'W'}ithdrawal frozen for ${transaction.user.firstName} ${transaction.user.lastName}`,
        userId: transaction.userId
      });
    } else if (action === 'unfreeze') {
      // Update transaction status back to pending
      const updatedTransaction = await prisma.transaction.update({ 
        where: { id: transactionId }, 
        data: { 
          status: 'pending',
          description: transaction.description.replace(' - Frozen', '')
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Broadcast real-time update for unfrozen withdrawal
      const eventType = transaction.type === 'commission_withdrawal' ? 'commission_withdrawal_unfrozen' : 'withdrawal_unfrozen';
      await broadcastRealtimeUpdate(eventType, {
        transaction: updatedTransaction,
        message: `${transaction.type === 'commission_withdrawal' ? 'Commission w' : 'W'}ithdrawal unfrozen for ${transaction.user.firstName} ${transaction.user.lastName}`,
        userId: transaction.userId
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Delete a withdrawal transaction (admin)
export async function DELETE(req: NextRequest) {
  try {
    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }
    
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (!transaction || !['withdrawal', 'commission_withdrawal'].includes(transaction.type)) {
      return NextResponse.json({ error: 'Withdrawal transaction not found' }, { status: 404 });
    }
    
    // If the transaction was approved, we need to reverse the balance changes
    if (transaction.status === 'approved') {
      if (transaction.type === 'commission_withdrawal') {
        // Add back to user's counter commission
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
          data: { totalEarnings: { increment: transaction.amount } }
        });
      } else {
        // Add back to user's counter balance
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
          data: { balance: { increment: transaction.amount } }
        });
        
        // Add back to user's total balance
        await prisma.user.update({
          where: { id: transaction.userId },
          data: { totalBalance: { increment: transaction.amount } }
        });
      }
    }
    
    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    });
    
    // Broadcast real-time update
    const eventType = transaction.type === 'commission_withdrawal' ? 'commission_withdrawal_deleted' : 'withdrawal_deleted';
    await broadcastRealtimeUpdate(eventType, {
      transactionId,
      message: `${transaction.type === 'commission_withwithdrawal' ? 'Commission w' : 'W'}ithdrawal transaction deleted for ${transaction.user.firstName} ${transaction.user.lastName}`,
      userId: transaction.userId
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting withdrawal transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Edit a withdrawal transaction (admin)
export async function PUT(req: NextRequest) {
  try {
    const { transactionId, amount, description } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }
    
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (!transaction || !['withdrawal', 'commission_withdrawal'].includes(transaction.type)) {
      return NextResponse.json({ error: 'Withdrawal transaction not found' }, { status: 404 });
    }
    
    const oldAmount = transaction.amount;
    const newAmount = parseFloat(amount);
    const amountDifference = newAmount - oldAmount;
    
    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: newAmount,
        description: description || transaction.description
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    // If the transaction was approved and amount changed, adjust balances
    if (transaction.status === 'approved' && amountDifference !== 0) {
      if (transaction.type === 'commission_withdrawal') {
        // Adjust user's counter commission (subtract the difference)
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
          data: { totalEarnings: { decrement: amountDifference } }
        });
      } else {
        // Adjust user's counter balance (subtract the difference)
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
          data: { balance: { decrement: amountDifference } }
        });
        
        // Adjust user's total balance (subtract the difference)
        await prisma.user.update({
          where: { id: transaction.userId },
          data: { totalBalance: { decrement: amountDifference } }
        });
      }
    }
    
    // Broadcast real-time update
    const eventType = transaction.type === 'commission_withdrawal' ? 'commission_withdrawal_edited' : 'withdrawal_edited';
    await broadcastRealtimeUpdate(eventType, {
      transaction: updatedTransaction,
      message: `${transaction.type === 'commission_withwithdrawal' ? 'Commission w' : 'W'}ithdrawal transaction edited for ${transaction.user.firstName} ${transaction.user.lastName}`,
      userId: transaction.userId
    });
    
    return NextResponse.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.error('Error editing withdrawal transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
