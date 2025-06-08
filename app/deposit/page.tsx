'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FaWallet, 
  FaArrowLeft, 
  FaCheck, 
  FaCreditCard,
  FaUniversity,
  FaPaypal,
  FaBitcoin,
  FaInfo,
  FaExclamationTriangle,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import { useMoneyExchange, COUNTERS } from '../contexts/MoneyExchangeContext';
import MobileNav from '../components/MobileNav';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { getUserSession } from '../utils/session';

export default function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch, syncWithServer } = useMoneyExchange();
  const [selectedCounter, setSelectedCounter] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [depositStatus, setDepositStatus] = useState<'pending' | 'approved' | 'denied' | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  useEffect(() => {
    const counter = searchParams.get('counter');
    if (counter) {
      setSelectedCounter(parseInt(counter));
    }
  }, [searchParams]);  // Listen for real-time updates on deposit status
  useRealtimeUpdates((event) => {
    const userSession = getUserSession();
    if (!userSession) return;
    
    if (event.type === 'deposit_approved' && event.payload.userId.toString() === userSession.id) {
      setDepositStatus('approved');
      setShowSuccess(true);
      dispatch({
        type: 'DEPOSIT',
        payload: {
          counterId: selectedCounter!,
          amount: parseFloat(depositAmount),
        },
      });
      // Ensure latest state from server
      if (typeof syncWithServer === 'function') {
        syncWithServer();
      }
    } else if (event.type === 'deposit_denied' && event.payload.userId.toString() === userSession.id) {
      setDepositStatus('denied');
      setIsLoading(false);
    }
  });

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: <FaCreditCard />, fee: '2.9%' },
    { id: 'bank', name: 'Bank Transfer', icon: <FaUniversity />, fee: 'Free' },
    { id: 'paypal', name: 'PayPal', icon: <FaPaypal />, fee: '3.4%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: <FaBitcoin />, fee: '1.5%' },
  ];  const handleDeposit = async () => {
    if (!selectedCounter || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    const counter = COUNTERS[selectedCounter];

    if (amount < counter.minDeposit) {
      alert(`Minimum deposit for ${counter.name} is $${counter.minDeposit}`);
      return;
    }

    // Get actual user session
    const userSession = getUserSession();
    if (!userSession) {
      alert('Please log in to make a deposit');
      return;
    }

    setIsLoading(true);

    try {
      // Create deposit request via API
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userSession.id,
          counterId: selectedCounter,
          amount: amount,
          paymentMethod: paymentMethods.find(m => m.id === paymentMethod)?.name
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transaction.id);
        setDepositStatus('pending');
        // Keep loading state until admin approves/denies
      } else {
        alert('Failed to create deposit request. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating deposit request:', error);
      alert('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };if (showSuccess && depositStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="frosted p-6 sm:p-8 rounded-2xl text-center max-w-md mx-auto w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <FaCheck className="text-2xl sm:text-3xl text-green-400" />
          </motion.div>          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Deposit Approved!</h2>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Your deposit is successfully credited into your counter.
          </p>
          <button
            onClick={() => router.push(`/counter/${selectedCounter}`)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Start Trading
          </button>
        </motion.div>
      </div>
    );
  }

  if (depositStatus === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="frosted p-6 sm:p-8 rounded-2xl text-center max-w-md mx-auto w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <FaTimes className="text-2xl sm:text-3xl text-red-400" />
          </motion.div>          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Deposit Denied</h2>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Deposit denied. Please check your receipt again.
          </p>
          <button
            onClick={() => {
              setDepositStatus(null);
              setDepositAmount('');
              setIsLoading(false);
            }}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (depositStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="frosted p-6 sm:p-8 rounded-2xl text-center max-w-md mx-auto w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <FaClock className="text-2xl sm:text-3xl text-yellow-400" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Pending Approval</h2>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Your deposit request of ${depositAmount} has been submitted and is awaiting admin approval.
          </p>
          <p className="text-xs sm:text-sm text-blue-400 mb-4">
            You will be notified in real-time when your deposit is processed.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-white text-sm sm:text-base" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              <span className="hidden sm:inline">Make Deposit</span>
              <span className="sm:hidden">Deposit</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              <span className="hidden sm:inline">Fund your counter to start trading</span>
              <span className="sm:hidden">Fund counter</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-8">        {/* Counter Selection */}
        {!selectedCounter && (
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">Select Counter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(COUNTERS).map(([id, counter]) => {
                const counterId = parseInt(id);
                const counterData = state.counters[counterId];
                
                return (
                  <motion.div
                    key={counterId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCounter(counterId)}
                    className="frosted p-4 sm:p-6 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <h3 className="text-white font-bold mb-2 text-sm sm:text-base truncate">{counter.name}</h3>                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Deposit:</span>
                        <span className="text-blue-400">${counter.minDeposit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Commission:</span>
                        <span className="text-green-400">{counter.commission}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exchange Range:</span>
                        <span className="text-orange-400 text-xs">${counter.exchangeAmountMin}-${counter.exchangeAmountMax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Balance:</span>
                        <span className="text-yellow-400">${counterData.balance.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Counter Info */}
        {selectedCounter && (          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="frosted p-4 sm:p-6 rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                <span className="hidden sm:inline">Deposit to {COUNTERS[selectedCounter].name}</span>
                <span className="sm:hidden">Deposit to Counter</span>
              </h2>
              <button
                onClick={() => setSelectedCounter(null)}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                Change Counter
              </button>
            </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">              <div className="text-center p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-xs sm:text-sm">Minimum Deposit</p>
                <p className="text-blue-400 font-bold text-sm sm:text-base">${COUNTERS[selectedCounter].minDeposit}</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-xs sm:text-sm">Commission Rate</p>
                <p className="text-green-400 font-bold text-sm sm:text-base">{COUNTERS[selectedCounter].commission}%</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-xs sm:text-sm">Min Exchange</p>
                <p className="text-orange-400 font-bold text-sm sm:text-base">${COUNTERS[selectedCounter].exchangeAmountMin}</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-xs sm:text-sm">Max Exchange</p>
                <p className="text-cyan-400 font-bold text-sm sm:text-base">${COUNTERS[selectedCounter].exchangeAmountMax.toLocaleString()}</p>
              </div>
            </div>            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <FaInfo className="text-blue-400 mt-1 text-sm sm:text-base" />
                <div>
                  <p className="text-blue-300 font-medium mb-1 text-sm sm:text-base">Counter Description</p>
                  <p className="text-gray-300 text-xs sm:text-sm line-clamp-2">{COUNTERS[selectedCounter].description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <FaExclamationTriangle className="text-orange-400 mt-1 text-sm sm:text-base" />
                <div>
                  <p className="text-orange-300 font-medium mb-1 text-sm sm:text-base">Exchange Amount Limits</p>
                  <p className="text-gray-300 text-xs sm:text-sm">
                    Exchange orders in this counter will range from <span className="text-orange-400 font-semibold">${COUNTERS[selectedCounter].exchangeAmountMin}</span> to <span className="text-cyan-400 font-semibold">${COUNTERS[selectedCounter].exchangeAmountMax.toLocaleString()}</span> based on your deposit level.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Deposit Amount */}
        {selectedCounter && (          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="frosted p-4 sm:p-6 rounded-xl space-y-4"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white">Deposit Amount</h3>
            
            <div className="space-y-2">
              <label className="text-gray-400 text-xs sm:text-sm">Amount (USD)</label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={`Minimum $${COUNTERS[selectedCounter].minDeposit}`}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                />
                <div className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 text-sm sm:text-base">USD</div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                COUNTERS[selectedCounter].minDeposit,
                COUNTERS[selectedCounter].minDeposit * 2,
                COUNTERS[selectedCounter].minDeposit * 5,
                COUNTERS[selectedCounter].minDeposit * 10
              ].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDepositAmount(amount.toString())}
                  className="py-2 px-2 sm:px-3 bg-gray-700/50 hover:bg-blue-600/30 rounded-lg text-white transition-colors text-xs sm:text-sm"
                >
                  ${amount}
                </button>
              ))}
            </div>            {depositAmount && parseFloat(depositAmount) < COUNTERS[selectedCounter].minDeposit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="text-red-400 text-sm" />
                  <p className="text-red-300 text-xs sm:text-sm">
                    Amount must be at least ${COUNTERS[selectedCounter].minDeposit}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Payment Method */}
        {selectedCounter && depositAmount && (          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="frosted p-4 sm:p-6 rounded-xl space-y-4"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white">Payment Method</h3>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'bg-blue-500/20 border-2 border-blue-500/50'
                      : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className={`text-lg sm:text-xl ${
                    paymentMethod === method.id ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm sm:text-base">{method.name}</p>
                    <p className="text-xs sm:text-sm text-gray-400">Processing fee: {method.fee}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <FaCheck className="text-blue-400 text-sm sm:text-base" />
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Deposit Summary & Button */}
        {selectedCounter && depositAmount && parseFloat(depositAmount) >= COUNTERS[selectedCounter].minDeposit && (          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="frosted p-4 sm:p-6 rounded-xl space-y-4 sm:space-y-6"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white">Deposit Summary</h3>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Counter:</span>
                <span className="text-white text-sm sm:text-base truncate ml-2">{COUNTERS[selectedCounter].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Deposit Amount:</span>
                <span className="text-white text-sm sm:text-base">${parseFloat(depositAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Payment Method:</span>
                <span className="text-white text-sm sm:text-base">
                  {paymentMethods.find(m => m.id === paymentMethod)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Processing Fee:</span>
                <span className="text-white text-sm sm:text-base">
                  {paymentMethods.find(m => m.id === paymentMethod)?.fee}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeposit}
              disabled={isLoading}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <FaWallet className="text-sm sm:text-base" />
                  <span>Confirm Deposit</span>
                </div>
              )}
            </motion.button>          </motion.div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
