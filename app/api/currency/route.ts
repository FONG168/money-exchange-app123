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

// GET: Fetch all currency pairs
export async function GET() {
  try {
    const currencies = await prisma.currencyPair.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ success: true, currencies });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch currencies' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Add, edit, delete, move currency pairs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === 'add') {
      // Add new currency pair
      const last = await prisma.currencyPair.findFirst({ orderBy: { order: 'desc' } });
      const order = last ? last.order + 1 : 1;
      const currency = await prisma.currencyPair.create({
        data: { from: body.from, to: body.to, name: body.name, order },
      });
      // await broadcastRealtimeUpdate('currency', currency);
      return NextResponse.json({ success: true, currency });
    } else if (action === 'delete') {
      const currency = await prisma.currencyPair.delete({ where: { id: body.id } });
      // await broadcastRealtimeUpdate('currency', currency);
      return NextResponse.json({ success: true });
    } else if (action === 'edit') {
      const currency = await prisma.currencyPair.update({
        where: { id: body.id },
        data: { from: body.from, to: body.to, name: body.name },
      });
      // await broadcastRealtimeUpdate('currency', currency);
      return NextResponse.json({ success: true, currency });
    } else if (action === 'move') {
      // Move currency up or down
      const current = await prisma.currencyPair.findUnique({ where: { id: body.id } });
      if (!current) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      const direction = body.direction;
      const swapOrder = direction === 'up' ? current.order - 1 : current.order + 1;
      const swapWith = await prisma.currencyPair.findFirst({ where: { order: swapOrder } });
      if (!swapWith) return NextResponse.json({ success: false, error: 'Cannot move' }, { status: 400 });
      await prisma.currencyPair.update({ where: { id: current.id }, data: { order: swapOrder } });
      await prisma.currencyPair.update({ where: { id: swapWith.id }, data: { order: current.order } });
      // await broadcastRealtimeUpdate('currency', [current, swapWith]);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
