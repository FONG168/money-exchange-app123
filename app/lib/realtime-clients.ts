// Shared real-time clients and broadcast utility

export const clients: Set<ReadableStreamDefaultController> = new Set();

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
