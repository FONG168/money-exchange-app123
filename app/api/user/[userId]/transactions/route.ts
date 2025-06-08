import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 transactions
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
