'use client';

import { useState, useEffect } from 'react';
import { getUserSession, setUserSession, clearUserSession } from '../utils/session';

const DebugPage = () => {
  const [session, setSessionState] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<string>('Not started');
  const [syncData, setSyncData] = useState<any>(null);

  useEffect(() => {
    const currentSession = getUserSession();
    setSessionState(currentSession);
  }, []);

  const testAuth = async () => {
    try {
      setSyncStatus('Testing authentication...');
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: 'test@gmail.com',
          password: 'test123'
        })
      });

      const data = await response.json();
      setSyncStatus(`Auth response: ${JSON.stringify(data)}`);
      
      if (data.user) {
        setUserSession({
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName
        });
        setSessionState(getUserSession());
      }
    } catch (error) {
      setSyncStatus(`Auth error: ${error}`);
    }
  };

  const testSync = async () => {
    try {
      setSyncStatus('Testing sync...');
      const session = getUserSession();
      
      if (!session) {
        setSyncStatus('No session found - please test auth first');
        return;
      }

      const response = await fetch('/api/user/sync', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': session.id,
        },
      });

      const data = await response.json();
      setSyncStatus(`Sync response status: ${response.status}`);
      setSyncData(data);
    } catch (error) {
      setSyncStatus(`Sync error: ${error}`);
    }
  };

  const testSaveData = async () => {
    try {
      setSyncStatus('Testing save data...');
      const session = getUserSession();
      
      if (!session) {
        setSyncStatus('No session found - please test auth first');
        return;
      }

      const testData = {
        user: {
          id: session.id,
          email: session.email,
          firstName: session.firstName,
          lastName: session.lastName,
          totalBalance: 1000,
        },
        counters: {
          1: {
            balance: 500,
            totalEarnings: 50,
            completedTasks: 10,
            dailyCompletedOrders: 5,
            lastActivityDate: new Date().toISOString(),
            lastOrderResetDate: new Date().toDateString(),
            isActive: true,
            canWithdraw: false,
          }
        },
        transactions: [
          {
            id: `test_${Date.now()}`,
            type: 'deposit',
            counterId: 1,
            amount: 500,
            timestamp: new Date().toISOString(),
            status: 'completed',
            description: 'Test deposit',
          }
        ]
      };

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': session.id,
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setSyncStatus(`Save response: ${JSON.stringify(data)}`);
    } catch (error) {
      setSyncStatus(`Save error: ${error}`);
    }
  };

  const clearSession = () => {
    clearUserSession();
    setSessionState(null);
    setSyncStatus('Session cleared');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Sync Functionality</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Session</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {session ? JSON.stringify(session, null, 2) : 'No session'}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-x-4">
          <button 
            onClick={testAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Auth
          </button>
          <button 
            onClick={testSync}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Sync
          </button>
          <button 
            onClick={testSaveData}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Test Save Data
          </button>
          <button 
            onClick={clearSession}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Session
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          {syncStatus}
        </div>
      </div>

      {syncData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Sync Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(syncData, null, 2)}
          </pre>
        </div>
      )}
    </div>  );
};

export default DebugPage;
