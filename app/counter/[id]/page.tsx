'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaPlay, 
  FaClock, 
  FaExchangeAlt, 
  FaDollarSign,
  FaWallet,
  FaTasks,
  FaChartLine,
  FaSyncAlt,
  FaArrowRight
} from 'react-icons/fa';
import { useMoneyExchange, COUNTERS, generateRandomOrder, canAccessCounter } from '../../contexts/MoneyExchangeContext';
import MobileNav from '../../components/MobileNav';

export default function CounterPage() {
  const router = useRouter();
  const params = useParams();
  const { state, dispatch, syncWithServer } = useMoneyExchange();
  
  const counterId = parseInt(params.id as string);
  const counter = COUNTERS[counterId];
  const counterData = state.counters[counterId];
    const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [nextCounterId, setNextCounterId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);
    syncWithServer().finally(() => {
      if (isMounted) setIsSyncing(false);
    });
    return () => { isMounted = false; };
  }, [syncWithServer, counterId]);

  useEffect(() => {
    if (!counter) {
      router.push('/dashboard');
      return;
    }

    // Check if current counter is completed today
    const currentDate = new Date().toDateString();
    const dailyCompletedToday = counterData.lastOrderResetDate === currentDate ? counterData.dailyCompletedOrders : 0;
    const isCounterCompleted = dailyCompletedToday >= counter.dailyOrders;

    if (isCounterCompleted) {
      // Find the next available counter to suggest
      const counterIds = Object.keys(COUNTERS).map(Number).sort((a, b) => a - b);
      const currentIndex = counterIds.indexOf(counterId);
      let suggestedCounterId = null;

      // Look for the next counter
      for (let i = currentIndex + 1; i < counterIds.length; i++) {
        const nextId = counterIds[i];
        const nextCounter = COUNTERS[nextId];
        const nextCounterData = state.counters[nextId];
        
        if (nextCounterData && nextCounterData.balance >= nextCounter.minDeposit) {
          // User can access this counter
          suggestedCounterId = nextId;
          break;
        } else {
          // User needs to deposit more to access this counter
          suggestedCounterId = nextId;
          break;
        }
      }

      setNextCounterId(suggestedCounterId);
      setShowUpgradeModal(true);
      return;
    }

    if (!canAccessCounter(counterId, counterData)) {
      setShowDepositModal(true);
      return;
    }

    // Generate initial order
    if (!currentOrder) {
      setCurrentOrder(generateRandomOrder(counterId));
    }
  }, [counterId, counter, counterData, router, currentOrder, state.counters]);

  useEffect(() => {
    if (currentOrder && currentOrder.expiresAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, currentOrder.expiresAt - Date.now());
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          // Generate new order when time expires
          setCurrentOrder(generateRandomOrder(counterId));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentOrder, counterId]);

  const handleStartExchange = () => {
    if (!currentOrder) return;

    dispatch({
      type: 'SET_CURRENT_EXCHANGE',
      payload: {
        counterId,
        pair: currentOrder.pair,
        amount: currentOrder.amount,
        rate: currentOrder.rate,
      },
    });

    router.push('/exchange');
  };

  const handleNewOrder = () => {
    setCurrentOrder(generateRandomOrder(counterId));
  };
  const handleWithdrawal = () => {
    // Withdrawal is only allowed if ALL counters have completed their dailyOrders
    const allCountersCompleted = Object.keys(state.counters).every(cid => {
      const numCid = Number(cid);
      const c = COUNTERS[numCid];
      const cd = state.counters[numCid];
      // Reset count if new day
      const currentDate = new Date().toDateString();
      const lastReset = cd.lastOrderResetDate === currentDate ? cd.dailyCompletedOrders : 0;
      return lastReset >= c.dailyOrders;
    });
    if (!allCountersCompleted) {
      alert('You must complete all daily order requirements for every counter before withdrawing.');
      return;
    }
    if (!counterData.canWithdraw) {
      alert(`You must complete ${counter.dailyOrders} daily orders before withdrawing from ${counter.name}. You have completed ${counterData.dailyCompletedOrders} orders today.`);
      return;
    }
    if (window.confirm(`Are you sure you want to withdraw all funds from ${counter.name}? This will reset your balance and earnings to zero.`)) {
      try {
        dispatch({
          type: 'REQUEST_WITHDRAWAL',
          payload: {
            counterId,
            amount: counterData.balance + counterData.totalEarnings,
          },
        });
        router.push('/dashboard');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Withdrawal failed');
      }
    }
  };

  // Wait for sync to complete before rendering access logic
  if (isSyncing || !state.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6" />
          <h1 className="text-xl font-bold text-white mb-2">Loading Counter...</h1>
          <p className="text-gray-400">Syncing your latest account state.</p>
        </div>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Counter Not Found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{counter.name}</h1>
              <p className="text-gray-400">{counter.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Balance</p>
            <p className="text-2xl font-bold text-green-400">${counterData.balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">        {/* Counter Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="frosted p-4 rounded-xl text-center">
            <FaWallet className="text-2xl text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Balance</p>
            <p className="text-white font-bold">${counterData.balance.toFixed(2)}</p>
          </div>
          
          <div className="frosted p-4 rounded-xl text-center">
            <FaDollarSign className="text-2xl text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-white font-bold">${counterData.totalEarnings.toFixed(2)}</p>
          </div>
          
          <div className="frosted p-4 rounded-xl text-center">
            <FaTasks className="text-2xl text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Daily Progress</p>
            <p className="text-white font-bold">
              {counterData.dailyCompletedOrders}/{counter.dailyOrders}
            </p>
          </div>
          
          <div className="frosted p-4 rounded-xl text-center">
            <FaChartLine className="text-2xl text-cyan-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Commission</p>
            <p className="text-white font-bold">{counter.commission}%</p>
          </div>
        </div>

        {/* Daily Progress Bar */}
        <div className="frosted p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Daily Order Progress</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              counterData.canWithdraw 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              {counterData.canWithdraw ? 'Withdrawal Available' : 'Complete Daily Orders'}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  counterData.canWithdraw 
                    ? 'bg-gradient-to-r from-green-500 to-green-400' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ 
                  width: `${Math.min((counterData.dailyCompletedOrders / counter.dailyOrders) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {counterData.dailyCompletedOrders} completed
              </span>
              <span className="text-gray-400">
                {counter.dailyOrders} required
              </span>
            </div>
          </div>
          
          {!counterData.canWithdraw && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 text-sm">
                <strong>Withdrawal Requirements:</strong> You need to complete {counter.dailyOrders - counterData.dailyCompletedOrders} more orders today to unlock withdrawals.
              </p>
            </div>
          )}
        </div>

        {/* Current Order */}
        {currentOrder && canAccessCounter(counterId, counterData) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="frosted p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Current Exchange Order</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-orange-400">
                  <FaClock />
                  <span className="font-mono font-bold">
                    {Math.floor(timeLeft / 1000)}s
                  </span>
                </div>                <button
                  onClick={handleNewOrder}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <FaSyncAlt className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-white font-bold mb-3">Exchange Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Currency Pair:</span>
                      <span className="text-white font-mono">
                        {currentOrder.pair.from}/{currentOrder.pair.to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-blue-400 font-bold">
                        {currentOrder.amount} {currentOrder.pair.from}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Exchange Rate:</span>
                      <span className="text-green-400 font-bold">
                        {currentOrder.rate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated Output:</span>
                      <span className="text-purple-400 font-bold">
                        {(currentOrder.amount * currentOrder.rate).toFixed(2)} {currentOrder.pair.to}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg p-4 border border-green-500/20">
                  <h3 className="text-white font-bold mb-3">Commission Calculation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Commission Rate:</span>
                      <span className="text-green-400">{counter.commission}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Commission Amount:</span>
                      <span className="text-green-400 font-bold">
                        ${(currentOrder.amount * (counter.commission / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-4 border-blue-500/30">
                    <FaExchangeAlt className="text-4xl text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {currentOrder.pair.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Complete this exchange to earn commission
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartExchange}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <FaPlay />
                  <span>Start Exchange</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/history')}
            className="frosted p-4 rounded-xl text-center hover:bg-blue-500/10 transition-colors"
          >
            <FaTasks className="text-2xl text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">View History</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/deposit?counter=${counterId}`)}
            className="frosted p-4 rounded-xl text-center hover:bg-green-500/10 transition-colors"
          >
            <FaWallet className="text-2xl text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Add Funds</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard')}
            className="frosted p-4 rounded-xl text-center hover:bg-purple-500/10 transition-colors"
          >
            <FaChartLine className="text-2xl text-purple-400 mx-auto mb-2" />
            <p className="text-white font-medium">Dashboard</p>
          </motion.button>          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/withdrawal')}
            className={`frosted p-4 rounded-xl text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              counterData.canWithdraw 
                ? 'hover:bg-green-500/10 border border-green-500/30' 
                : 'hover:bg-red-500/10 border border-red-500/30'
            }`}
          >
            <FaArrowRight className={`text-2xl mx-auto mb-2 ${
              counterData.canWithdraw ? 'text-green-400' : 'text-red-400'
            }`} />
            <p className="text-white font-medium">
              {counterData.canWithdraw ? 'Withdraw' : 'Locked'}
            </p>
            {!counterData.canWithdraw && (
              <p className="text-xs text-red-400 mt-1">
                {counter.dailyOrders - counterData.dailyCompletedOrders} orders left
              </p>
            )}
          </motion.button>
        </div>        {/* Counter Requirements & Limits */}
        <div className="frosted p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">Counter Requirements & Limits</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 mb-2">
                ${counter.minDeposit}
              </div>
              <p className="text-gray-400 text-sm">Minimum Deposit Required</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {counter.dailyOrders}
              </div>
              <p className="text-gray-400 text-sm">Daily Order Limit</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {counter.commission}%
              </div>
              <p className="text-gray-400 text-sm">Commission Rate</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
              <div className="text-xl font-bold text-orange-400 mb-2">
                ${counter.exchangeAmountMin}
              </div>
              <p className="text-gray-400 text-sm">Min Exchange Amount</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 rounded-lg border border-cyan-500/20">
              <div className="text-xl font-bold text-cyan-400 mb-2">
                ${counter.exchangeAmountMax.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">Max Exchange Amount</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-lg border border-gray-500/20">
            <h4 className="text-white font-semibold mb-2">Exchange Amount Range</h4>
            <p className="text-gray-400 text-sm">
              Orders in this counter will range from <span className="text-orange-400 font-semibold">${counter.exchangeAmountMin}</span> to <span className="text-cyan-400 font-semibold">${counter.exchangeAmountMax.toLocaleString()}</span> based on your deposit level.
            </p>
          </div>
        </div>
      </div>      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="frosted p-6 rounded-xl max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-white mb-4">Deposit Required</h2>
              <p className="text-gray-400 mb-6">
                You need to make a minimum deposit of ${counter.minDeposit} to access {counter.name}.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push(`/deposit?counter=${counterId}`)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Make Deposit
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && nextCounterId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="frosted p-6 rounded-xl max-w-lg w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTasks className="text-2xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">🎉 Counter Completed!</h2>
                <p className="text-green-400 font-medium">
                  You've successfully completed all daily orders for {counter.name}!
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                  <FaArrowRight className="mr-2 text-blue-400" />
                  Ready to Upgrade?
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Upgrade to {COUNTERS[nextCounterId]?.name} for higher limits and better commissions!
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">{COUNTERS[nextCounterId]?.commission}%</div>
                    <div className="text-gray-400">Commission</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">${COUNTERS[nextCounterId]?.exchangeAmountMax.toLocaleString()}</div>
                    <div className="text-gray-400">Max Exchange</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {state.counters[nextCounterId]?.balance >= COUNTERS[nextCounterId]?.minDeposit ? (
                  <>
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        router.push(`/counter/${nextCounterId}`);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaArrowRight />
                      <span>Upgrade to {COUNTERS[nextCounterId]?.name}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        router.push('/withdrawal');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaDollarSign />
                      <span>Withdraw Funds</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        router.push(`/deposit?counter=${nextCounterId}`);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FaArrowRight />
                      <span>Deposit for {COUNTERS[nextCounterId]?.name}</span>
                    </button>
                    <div className="text-center text-sm text-gray-400">
                      Need ${COUNTERS[nextCounterId]?.minDeposit} minimum deposit
                    </div>
                  </>
                )}
                
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    router.push('/dashboard');
                  }}
                  className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}
