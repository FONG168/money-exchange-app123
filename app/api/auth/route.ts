import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { action, email, password, firstName, lastName, agreeToTerms } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
  }

  try {
    if (action === 'register') {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Account already exists.' }, { status: 409 });
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          password,
          firstName,
          lastName,
          totalBalance: 0,
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Registration successful!',
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    }

    if (action === 'login') {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          counters: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 100
          }
        }
      });

      if (!user || user.password !== password) {
        return NextResponse.json({ success: false, message: 'Incorrect email or password.' }, { status: 401 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Login successful!',
        user: {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // For testing/demo: return all users (do not use in production)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      }    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
