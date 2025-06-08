'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaDollarSign, 
  FaChartLine, 
  FaCalendarDay,
  FaArrowUp,
  FaArrowDown,  FaWallet,
  FaExchangeAlt,
  FaPercent,
  FaSpinner
} from 'react-icons/fa';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

interface DailyIncomeData {
  success: boolean;
  date: string;
  dailyIncome: {
    totalIncome: number;
    commission: number;
    deposit: number;
    exchange: number;
    withdrawal: number;
    other: number;
  };
  totalDailyEarnings: number;
  counterIncome: Array<{
    counterId: number;
    currentBalance: number;
    totalEarnings: number;
    dailyCompletedOrders: number;
    isActive: boolean;
    todaysEarnings: number;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    counterId: number;
    description: string;
    createdAt: string;
  }>;
  summary: {
    activeCounters: number;
    totalCounters: number;
    totalTransactionsToday: number;
  };
}

interface IncomeStatementProps {
  userId: number;
}

const IncomeStatement: React.FC<IncomeStatementProps> = ({ userId }) => {
  const [incomeData, setIncomeData] = useState<DailyIncomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add real-time update listener for admin resets
  useRealtimeUpdates((event) => {
    // Listen for admin reset events and refetch if relevant
    if (
      (event.type === 'admin_reset_daily_tasks' || event.type === 'admin_reset_commissions' || event.type === 'admin_reset_exchangeTransactions' || event.type === 'admin_reset_all') &&
      (!event.payload.userId || event.payload.userId === userId)
    ) {
      fetchIncomeData();
    }
  });

  useEffect(() => {
    fetchIncomeData();
    // Refresh data every 30 seconds to keep it current
    const interval = setInterval(fetchIncomeData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${userId}/income`);
      const data = await response.json();
      
      if (data.success) {
        setIncomeData(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch income data');
      }
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-400 text-2xl mr-3" />
          <span className="text-gray-300">Loading income data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-700">
        <div className="text-center">
          <div className="text-red-400 text-lg font-medium mb-2">Error Loading Income Data</div>
          <div className="text-red-300 text-sm">{error}</div>
          <button 
            onClick={fetchIncomeData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!incomeData) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-center text-gray-400">No income data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaChartLine className="text-blue-400 text-2xl" />
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Income Statement</h2>
              <p className="text-blue-300">{new Date(incomeData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Total Daily Earnings</div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(incomeData.totalDailyEarnings)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/50"
        >
          <div className="flex items-center space-x-3">
            <FaPercent className="text-green-400 text-xl" />
            <div>
              <div className="text-sm text-gray-300">Commission</div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(incomeData.dailyIncome.commission)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-700/50"
        >
          <div className="flex items-center space-x-3">
            <FaWallet className="text-blue-400 text-xl" />
            <div>
              <div className="text-sm text-gray-300">Deposits</div>
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(incomeData.dailyIncome.deposit)}
              </div>
            </div>
          </div>
        </motion.div>        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-900/30 backdrop-blur-sm rounded-xl p-4 border border-red-700/50"
        >
          <div className="flex items-center space-x-3">
            <FaArrowDown className="text-red-400 text-xl" />
            <div>
              <div className="text-sm text-gray-300">Withdrawals</div>
              <div className="text-xl font-bold text-red-400">
                {formatCurrency(Math.abs(incomeData.dailyIncome.withdrawal))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Transactions */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <FaCalendarDay className="text-green-400 text-xl" />
          <h3 className="text-xl font-bold text-white">Today's Transactions</h3>
          <div className="ml-auto text-sm text-gray-400">
            {incomeData.summary.totalTransactionsToday} transactions
          </div>
        </div>
        
        {incomeData.transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No transactions recorded today
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {incomeData.transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600/50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'commission' ? 'bg-green-600/20 text-green-400' :
                    transaction.type === 'deposit' ? 'bg-blue-600/20 text-blue-400' :
                    transaction.type === 'exchange' ? 'bg-purple-600/20 text-purple-400' :
                    transaction.type.includes('withdrawal') ? 'bg-red-600/20 text-red-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {transaction.type === 'commission' ? <FaPercent /> :
                     transaction.type === 'deposit' ? <FaArrowUp /> :
                     transaction.type === 'exchange' ? <FaExchangeAlt /> :
                     transaction.type.includes('withdrawal') ? <FaArrowDown /> :
                     <FaDollarSign />}
                  </div>
                  <div>
                    <div className="text-white font-medium capitalize">
                      {transaction.type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-400">
                      Counter {transaction.counterId} • {formatTime(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type.includes('withdrawal') 
                    ? 'text-red-400' 
                    : 'text-green-400'
                }`}>
                  {transaction.type.includes('withdrawal') ? '-' : '+'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </motion.div>
            ))}          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeStatement;
