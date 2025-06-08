'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaWallet, 
  FaChartLine, 
  FaTasks, 
  FaHistory, 
  FaUser, 
  FaArrowRight,
  FaDollarSign,
  FaExchangeAlt,
  FaClock,
  FaLock,
  FaUnlock,
  FaPlay
} from 'react-icons/fa';
import { useMoneyExchange, COUNTERS, getCounterStatus } from '../contexts/MoneyExchangeContext';
import MobileNav from '../components/MobileNav';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

export default function DashboardPage() {
  const router = useRouter();
  const { state, dispatch } = useMoneyExchange();

  // Ban/freeze enforcement
  if (state.user.banned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Account Banned</h1>
        <p className="mb-4">Your account has been banned by the administrator. You no longer have access to the dashboard.</p>
        <button className="px-4 py-2 bg-red-600 rounded" onClick={() => window.location.href = '/auth'}>Return to Login</button>
      </div>
    );
  }  const isFrozen = state.user.frozen;

  // Note: User authentication and data syncing is handled by MoneyExchangeContext
  // No hardcoded user initialization needed here

  const totalBalance = Object.values(state.counters).reduce((sum, counter) => sum + counter.balance, 0);
  const totalEarnings = Object.values(state.counters).reduce((sum, counter) => sum + counter.totalEarnings, 0);
  const totalTasks = Object.values(state.counters).reduce((sum, counter) => sum + counter.completedTasks, 0);
  const activeCounters = Object.values(state.counters).filter(counter => counter.isActive).length;

  const handleCounterClick = (counterId: number) => {
    if (isFrozen) return; // Disable all actions if frozen
    const counterData = state.counters[counterId];
    const status = getCounterStatus(counterId, counterData);
    if (status === 'locked') {
      router.push(`/deposit?counter=${counterId}`);
    } else {
      router.push(`/counter/${counterId}`);
    }
  };

  useRealtimeUpdates((event) => {
    if (event.type === 'user') {
      // Optionally: dispatch({ type: 'UPDATE_USER', payload: event.payload })
      // Or trigger a refetch of user/counter state
      window.location.reload(); // Simple approach for demo
    }
    if (event.type === 'currency' || event.type === 'counter') {
      // Optionally: update local state or refetch as needed
      window.location.reload();
    }
  });

  return (    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              <span className="hidden sm:inline">Money Exchange Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400">Welcome back, {state.user.firstName}</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-400">Total Balance</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">${totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 pb-20 sm:pb-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="frosted p-3 sm:p-4 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <FaWallet className="text-xl sm:text-2xl text-blue-400 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Total Balance</p>
                <p className="text-lg sm:text-xl font-bold text-white">${totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="frosted p-3 sm:p-4 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <FaDollarSign className="text-xl sm:text-2xl text-green-400 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Total Earnings</p>
                <p className="text-lg sm:text-xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="frosted p-3 sm:p-4 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <FaTasks className="text-xl sm:text-2xl text-purple-400 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Completed Tasks</p>
                <p className="text-lg sm:text-xl font-bold text-white">{totalTasks}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="frosted p-3 sm:p-4 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <FaChartLine className="text-xl sm:text-2xl text-cyan-400 mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-gray-400">Active Counters</p>
                <p className="text-lg sm:text-xl font-bold text-white">{activeCounters}</p>
              </div>
            </div>
          </motion.div>
        </div>        {/* Counters Grid */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Exchange Counters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(COUNTERS).map(([id, counter], index) => {
              const counterId = parseInt(id);
              const counterData = state.counters[counterId];
              const status = getCounterStatus(counterId, counterData);
              
              return (
                <motion.div
                  key={counterId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleCounterClick(counterId)}
                  className="frosted p-4 sm:p-6 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300 border-2 border-transparent hover:border-blue-500/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate pr-2">{counter.name}</h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {status === 'locked' && <FaLock className="text-red-400 text-sm sm:text-base" />}
                      {status === 'available' && <FaUnlock className="text-yellow-400 text-sm sm:text-base" />}
                      {status === 'active' && <FaPlay className="text-green-400 text-sm sm:text-base" />}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Min Deposit:</span>
                      <span className="text-xs sm:text-sm text-white font-medium">${counter.minDeposit.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Current Balance:</span>
                      <span className="text-xs sm:text-sm text-green-400 font-medium">${counterData.balance.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Commission:</span>
                      <span className="text-xs sm:text-sm text-blue-400 font-medium">{counter.commission}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Daily Orders:</span>
                      <span className="text-xs sm:text-sm text-purple-400 font-medium">{counter.dailyOrders}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Daily Progress:</span>
                      <span className={`text-xs sm:text-sm font-medium ${
                        counterData.canWithdraw ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {counterData.dailyCompletedOrders}/{counter.dailyOrders}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Exchange Range:</span>
                      <span className="text-xs sm:text-sm text-orange-400 font-medium">
                        ${counter.exchangeAmountMin}-${counter.exchangeAmountMax.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Total Completed:</span>
                      <span className="text-xs sm:text-sm text-cyan-400 font-medium">{counterData.completedTasks}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-400">Earnings:</span>
                      <span className="text-xs sm:text-sm text-yellow-400 font-medium">${counterData.totalEarnings.toFixed(2)}</span>
                    </div>
                  </div>                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-600/50">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 line-clamp-2">{counter.description}</p>
                    
                    {/* Daily Progress Bar */}
                    {status === 'active' && (
                      <div className="mb-2 sm:mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Daily Progress</span>
                          <span>{counterData.dailyCompletedOrders}/{counter.dailyOrders}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                          <div 
                            className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                              counterData.canWithdraw 
                                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ 
                              width: `${Math.min((counterData.dailyCompletedOrders / counter.dailyOrders) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'locked' ? 'bg-red-500/20 text-red-400' :
                        status === 'available' ? 'bg-yellow-500/20 text-yellow-400' :
                        counterData.canWithdraw ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <span className="hidden sm:inline">
                          {status === 'locked' ? 'Deposit Required' :
                           status === 'available' ? 'Ready to Start' : 
                           counterData.canWithdraw ? 'Withdrawal Available' : 'Complete Daily Orders'}
                        </span>
                        <span className="sm:hidden">
                          {status === 'locked' ? 'Deposit' :
                           status === 'available' ? 'Ready' : 
                           counterData.canWithdraw ? 'Withdraw' : 'Complete'}
                        </span>
                      </span>
                      <FaArrowRight className="text-gray-400 text-xs sm:text-sm" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">Recent Activity</h2>
            <button
              onClick={() => !isFrozen && router.push('/withdrawal')}
              className={`px-5 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all text-sm sm:text-base shadow-md${isFrozen ? ' opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFrozen}
            >
              Withdraw Funds
            </button>
          </div>
          
          <div className="frosted p-4 sm:p-6 rounded-xl">
            {state.transactions.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FaHistory className="text-3xl sm:text-4xl text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-400">No transactions yet</p>
                <p className="text-xs sm:text-sm text-gray-500">Start by making a deposit to one of the counters</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {state.transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                        transaction.type === 'deposit' ? 'bg-blue-500/20 text-blue-400' :
                        transaction.type === 'exchange' ? 'bg-purple-500/20 text-purple-400' :
                        transaction.type === 'commission' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'deposit' && <FaWallet className="text-xs sm:text-sm" />}
                        {transaction.type === 'exchange' && <FaExchangeAlt className="text-xs sm:text-sm" />}
                        {transaction.type === 'commission' && <FaDollarSign className="text-xs sm:text-sm" />}
                        {transaction.type === 'withdrawal' && <FaArrowRight className="text-xs sm:text-sm" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base text-white font-medium truncate">{transaction.description}</p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          <FaClock className="inline mr-1 text-xs" />
                          <span className="hidden sm:inline">{new Date(transaction.timestamp).toLocaleString()}</span>
                          <span className="sm:hidden">{new Date(transaction.timestamp).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm sm:text-base font-bold ${
                        transaction.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </p>
                      {transaction.counterId && (
                        <p className="text-xs text-gray-400 truncate max-w-[100px] sm:max-w-none">
                          {COUNTERS[transaction.counterId].name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}              </div>            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
