import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

// Helper to broadcast real-time updates
async function broadcastRealtimeUpdate(type: string, payload: any) {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'}/api/realtime`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload, timestamp: Date.now() }),
  });
}

// GET: Fetch all users with counters and transactions
export async function GET(req: NextRequest) {
  const url = req.url || '';
  if (url.includes('type=counters')) {
    try {
      const counters = await prisma.counterLevel.findMany({ orderBy: { id: 'asc' } });
      const userCounters = await prisma.userCounter.findMany({ orderBy: { id: 'asc' } });
      return NextResponse.json({ success: true, counters, userCounters });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch counters' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
  try {
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
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Add a new user, delete, ban, freeze, update, etc.
export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const { email, password, firstName, lastName, action, userId, update } = body;
    if (action === 'add') {
      // Add user
      const user = await prisma.user.create({
        data: { email, password, firstName, lastName, totalBalance: 0, joinDate: new Date().toISOString() },
      });
      // await broadcastRealtimeUpdate('user', user);
      return NextResponse.json({ success: true, user });
    } else if (action === 'delete') {
      // Delete user
      await prisma.user.delete({ where: { id: userId } });
      // await broadcastRealtimeUpdate('user', { id: userId });
      return NextResponse.json({ success: true });
    } else if (action === 'ban') {
      // Ban user (set banned flag)
      const user = await prisma.user.update({ where: { id: userId }, data: { banned: true } });
      // await broadcastRealtimeUpdate('user', user);
      return NextResponse.json({ success: true, user });
    } else if (action === 'unban') {
      // Unban user
      const user = await prisma.user.update({ where: { id: userId }, data: { banned: false } });
      // await broadcastRealtimeUpdate('user', user);
      return NextResponse.json({ success: true, user });
    } else if (action === 'freeze') {
      // Freeze user (set frozen flag)
      const user = await prisma.user.update({ where: { id: userId }, data: { frozen: true } });
      // await broadcastRealtimeUpdate('user', user);
      return NextResponse.json({ success: true, user });
    } else if (action === 'unfreeze') {
      // Unfreeze user
      const user = await prisma.user.update({ where: { id: userId }, data: { frozen: false } });
      // await broadcastRealtimeUpdate('user', user);
      return NextResponse.json({ success: true, user });
    } else if (action === 'update' && update) {
      // Update user fields
      const user = await prisma.user.update({ where: { id: userId }, data: update });
      // await broadcastRealtimeUpdate('user', user);
      return NextResponse.json({ success: true, user });
    } else if (body.action === 'addCounter') {
      const counter = await prisma.counterLevel.create({
        data: {
          name: body.name,
          minDeposit: body.minDeposit,
          dailyOrders: body.dailyOrders,
          commission: body.commission,
          description: body.description,
          exchangeAmountMin: body.exchangeAmountMin,
          exchangeAmountMax: body.exchangeAmountMax,
        },
      });
      // await broadcastRealtimeUpdate('counter', counter);
      return NextResponse.json({ success: true, counter });
    } else if (body.action === 'editCounter') {
      const counter = await prisma.counterLevel.update({
        where: { id: body.id },
        data: {
          name: body.name,
          minDeposit: body.minDeposit,
          dailyOrders: body.dailyOrders,
          commission: body.commission,
          description: body.description,
          exchangeAmountMin: body.exchangeAmountMin,
          exchangeAmountMax: body.exchangeAmountMax,
        },
      });
      // await broadcastRealtimeUpdate('counter', counter);
      return NextResponse.json({ success: true, counter });
    } else if (body.action === 'deleteCounter') {
      await prisma.counterLevel.delete({ where: { id: body.id } });
      // await broadcastRealtimeUpdate('counter', { id: body.id });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process admin action' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
