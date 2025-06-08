'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaWallet,
  FaExchangeAlt, 
  FaDollarSign, 
  FaArrowRight,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaSync
} from 'react-icons/fa';
import { useMoneyExchange } from '../contexts/MoneyExchangeContext';
import MobileNav from '../components/MobileNav';

export default function HistoryPage() {
  const { state, syncWithServer } = useMoneyExchange();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refresh data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Using context's syncWithServer function to ensure we have latest data from API
        await syncWithServer();
      } catch (error) {
        console.error('Error syncing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [syncWithServer]);  // Filter transactions for display
  const filteredTransactions = state.transactions.filter((transaction) => {
    const matchesType = filter === 'all' || 
      transaction.type === filter || 
      (filter === 'withdrawal' && (transaction.type === 'withdrawal' || transaction.type === 'commission_withdrawal'));
    const matchesSearch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.counterId ? `Counter ${transaction.counterId}`.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                await syncWithServer();
              } finally {
                setIsLoading(false);
              }
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm text-white transition-colors"
            disabled={isLoading}
          >
            <FaSync className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Syncing..." : "Refresh Data"}
          </button>
        </div>
      </div><div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="frosted p-6 rounded-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('deposit')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filter === 'deposit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaWallet />
                Deposits
              </button>
              <button
                onClick={() => setFilter('exchange')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filter === 'exchange' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaExchangeAlt />
                Exchanges
              </button>
              <button
                onClick={() => setFilter('commission')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filter === 'commission' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaDollarSign />
                Commissions
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filter === 'withdrawal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaArrowRight />
                Withdrawals
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </motion.div>        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="frosted p-6 rounded-xl"
        >
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">                      <div className={`p-3 rounded-full ${
                        transaction.type === 'deposit' ? 'bg-blue-500/20 text-blue-400' :
                        transaction.type === 'exchange' ? 'bg-purple-500/20 text-purple-400' :
                        transaction.type === 'commission' ? 'bg-green-500/20 text-green-400' :
                        (transaction.type === 'withdrawal' || transaction.type === 'commission_withdrawal') ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {transaction.type === 'deposit' && <FaWallet />}
                        {transaction.type === 'exchange' && <FaExchangeAlt />}
                        {transaction.type === 'commission' && <FaDollarSign />}
                        {(transaction.type === 'withdrawal' || transaction.type === 'commission_withdrawal') && <FaArrowRight />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <FaClock className="inline mr-1" />
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'deposit' ? 'text-blue-400' :
                        transaction.type === 'exchange' ? 'text-purple-400' :
                        transaction.type === 'commission' ? 'text-green-400' :
                        'text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : 
                         transaction.type === 'commission' ? '+' : 
                         transaction.type === 'withdrawal' ? '-' : ''}
                        ${transaction.amount.toFixed(2)}
                      </p>
                      {transaction.counterId && (
                        <p className="text-sm text-gray-400">Counter {transaction.counterId}</p>
                      )}
                      {transaction.fromCurrency && transaction.toCurrency && (
                        <p className="text-sm text-gray-400">
                          {transaction.fromCurrency} → {transaction.toCurrency}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional details for exchange transactions */}
                  {transaction.type === 'exchange' && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">From</p>
                        <p className="text-white">{transaction.amount} {transaction.fromCurrency}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rate</p>
                        <p className="text-white">{transaction.exchangeRate?.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">To</p>
                        <p className="text-white">
                          {transaction.amount && transaction.exchangeRate 
                            ? (transaction.amount * transaction.exchangeRate).toFixed(2) 
                            : '0.00'} {transaction.toCurrency}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">No transactions found</p>
            </div>          )}
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
