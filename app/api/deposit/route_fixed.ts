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

// POST: Create a new deposit request (pending)
export async function POST(req: NextRequest) {
  try {
    const { userId, counterId, amount, paymentMethod } = await req.json();
    if (!userId || !counterId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const transaction = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        userId: parseInt(userId),
        type: 'deposit',
        counterId: parseInt(counterId),
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
        status: 'pending',
        description: `Deposit request via ${paymentMethod}`,
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
    
    // Broadcast real-time update for new deposit request
    await broadcastRealtimeUpdate('deposit_created', {
      transaction,
      message: `New deposit request from ${transaction.user.firstName} ${transaction.user.lastName}`
    });
    
    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating deposit request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET: List all pending deposit requests (for admin)
export async function GET() {
  try {
    const pendingDeposits = await prisma.transaction.findMany({
      where: { type: 'deposit', status: 'pending' },
      orderBy: { createdAt: 'asc' },
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
    
    return NextResponse.json({ success: true, pendingDeposits });
  } catch (error) {
    console.error('Error fetching pending deposits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: Approve or deny a deposit request (admin)
export async function PATCH(req: NextRequest) {
  try {
    const { transactionId, action } = await req.json();
    if (!transactionId || !['approve', 'deny'].includes(action)) {
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
      // Credit the user's counter
      await prisma.userCounter.update({
        where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
        data: { balance: { increment: transaction.amount } },
      });
      
      // Also increment user's totalBalance
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { totalBalance: { increment: transaction.amount } },
      });
      
      // Update transaction status and description to include Success
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
      
      // Broadcast real-time update for approved deposit
      await broadcastRealtimeUpdate('deposit_approved', {
        transaction: updatedTransaction,
        message: `Deposit approved for ${transaction.user.firstName} ${transaction.user.lastName}`,
        userId: transaction.userId
      });
    } else if (action === 'deny') {
      // Update transaction status and description to include Denied
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
      });
      
      // Broadcast real-time update for denied deposit
      await broadcastRealtimeUpdate('deposit_denied', {
        transaction: updatedTransaction,
        message: `Deposit denied for ${transaction.user.firstName} ${transaction.user.lastName}`,
        userId: transaction.userId
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating deposit status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
