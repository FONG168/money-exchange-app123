import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { v4 as uuidv4 } from 'uuid';
import { broadcastRealtimeUpdate } from '@/app/lib/realtime-clients';

const prisma = new PrismaClient();

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
  }
}

// GET: List all deposit requests (for admin)
export async function GET() {
  try {
    const allDeposits = await prisma.transaction.findMany({
      where: { type: 'deposit' },
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
    
    return NextResponse.json({ success: true, allDeposits });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      // Credit the user's counter and activate it
      await prisma.userCounter.update({
        where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId! } },
        data: { balance: { increment: transaction.amount }, isActive: true },
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

// DELETE: Delete a deposit transaction (admin)
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
    
    if (!transaction || transaction.type !== 'deposit') {
      return NextResponse.json({ error: 'Deposit transaction not found' }, { status: 404 });
    }
    
    // If the transaction was approved, we need to reverse the balance changes
    if (transaction.status === 'approved') {
      // Deduct from user's total balance
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { totalBalance: { decrement: transaction.amount } }
      });
      
      // Deduct from user's counter balance if counterId exists
      if (transaction.counterId) {
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId } },
          data: { balance: { decrement: transaction.amount } }
        });
      }
    }
    
    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    });
    
    // Broadcast real-time update
    await broadcastRealtimeUpdate('deposit_deleted', {
      transactionId,
      message: `Deposit transaction deleted for ${transaction.user.firstName} ${transaction.user.lastName}`,
      userId: transaction.userId
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deposit transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Edit a deposit transaction (admin)
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
    
    if (!transaction || transaction.type !== 'deposit') {
      return NextResponse.json({ error: 'Deposit transaction not found' }, { status: 404 });
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
      // Update user's total balance
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { totalBalance: { increment: amountDifference } }
      });
      
      // Update user's counter balance if counterId exists
      if (transaction.counterId) {
        await prisma.userCounter.update({
          where: { userId_counterId: { userId: transaction.userId, counterId: transaction.counterId } },
          data: { balance: { increment: amountDifference } }
        });
      }
    }
    
    // Broadcast real-time update
    await broadcastRealtimeUpdate('deposit_edited', {
      transaction: updatedTransaction,
      message: `Deposit transaction edited for ${transaction.user.firstName} ${transaction.user.lastName}`,
      userId: transaction.userId
    });
    
    return NextResponse.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.error('Error editing deposit transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}