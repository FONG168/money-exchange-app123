'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaFilter,
  FaCalendarAlt
} from 'react-icons/fa';
import { useMoneyExchange } from '../contexts/MoneyExchangeContext';
import IncomeStatement from '../components/IncomeStatement';
import MobileNav from '../components/MobileNav';

export default function IncomeStatementPage() {
  const router = useRouter();
  const { state } = useMoneyExchange();
  const [dateRange, setDateRange] = useState('today');
  const [showFilters, setShowFilters] = useState(false);

  const handleBack = () => {
    router.push('/profile');
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log('Downloading income statement...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Income Statement</h1>
              <p className="text-gray-400 text-sm">Detailed financial overview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaDownload />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaPrint />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-400" />
              <span className="text-gray-300">Date Range:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
        {/* User Info Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="frosted p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {state.user.firstName} {state.user.lastName}
              </h2>
              <p className="text-gray-400">{state.user.email}</p>
              <p className="text-sm text-gray-500">
                Member since: {new Date(state.user.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Balance</p>
              <p className="text-3xl font-bold text-blue-400">
                ${state.user.totalBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>        {/* Enhanced Income Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <IncomeStatement userId={parseInt(state.user.id)} />
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
