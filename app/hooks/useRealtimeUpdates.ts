import { useEffect, useRef } from 'react';

export function useRealtimeUpdates(onUpdate: (event: any) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);
  useEffect(() => {
    console.log('🌐 Establishing real-time connection to /api/realtime');
    const eventSource = new EventSource('/api/realtime');
    
    eventSource.onopen = () => {
      console.log('✅ Real-time connection established');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Real-time message received:', data);
        onUpdate(data);
      } catch (e) {
        console.log('⚠️ Failed to parse real-time message:', event.data);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ Real-time connection error:', error);
      eventSource.close();
    };
    
    eventSourceRef.current = eventSource;
    
    return () => {
      console.log('🔌 Closing real-time connection');
      eventSource.close();
    };
  }, [onUpdate]);
}
