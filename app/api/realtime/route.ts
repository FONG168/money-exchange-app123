import { NextRequest, NextResponse } from 'next/server';
import { clients } from '@/app/lib/realtime-clients';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Add client to the set
      clients.add(controller);
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time connection established' })}\n\n`);
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          clients.delete(controller);
        }
      }, 30000);
      
      // Clean up when connection closes
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clients.delete(controller);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { type, payload } = await req.json();
    
    // Broadcast to all connected clients
    const message = JSON.stringify({ type, payload, timestamp: Date.now() });
    const deadClients: ReadableStreamDefaultController[] = [];
    
    clients.forEach(controller => {
      try {
        controller.enqueue(`data: ${message}\n\n`);
      } catch (error) {
        // Client disconnected, mark for removal
        deadClients.push(controller);
      }
    });
    
    // Remove dead clients
    deadClients.forEach(controller => clients.delete(controller));
    
    return NextResponse.json({ 
      success: true, 
      clientsNotified: clients.size,
      message: 'Broadcast sent successfully'
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    return NextResponse.json({ error: 'Failed to broadcast message' }, { status: 500 });
  }
}
