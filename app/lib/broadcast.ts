// Utility for broadcasting real-time updates to all connected clients

// Import the clients set from the realtime API route
import { clients } from '../api/realtime/route';

export async function broadcastRealtimeUpdate(type: string, payload: any) {
  const message = JSON.stringify({ type, payload, timestamp: Date.now() });
  const deadClients: ReadableStreamDefaultController[] = [];
  clients.forEach(controller => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      deadClients.push(controller);
    }
  });
  deadClients.forEach(controller => clients.delete(controller));
}
