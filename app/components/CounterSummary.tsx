import React from 'react';
import { FaWallet, FaDollarSign, FaTasks, FaChartLine } from 'react-icons/fa';

interface CounterSummaryProps {
  balance: number;
  totalEarnings: number;
  dailyCompletedOrders: number;
  dailyOrders: number;
  commission: number;
  canWithdraw: boolean;
}

const CounterSummary: React.FC<CounterSummaryProps> = ({
  balance,
  totalEarnings,
  dailyCompletedOrders,
  dailyOrders,
  commission,
  canWithdraw,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="frosted p-4 rounded-xl text-center">
          <FaWallet className="text-2xl text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Balance</p>
          <p className="text-white font-bold">${balance.toFixed(2)}</p>
        </div>
        <div className="frosted p-4 rounded-xl text-center">
          <FaDollarSign className="text-2xl text-green-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Total Earnings</p>
          <p className="text-white font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="frosted p-4 rounded-xl text-center">
          <FaTasks className="text-2xl text-purple-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Daily Progress</p>
          <p className="text-white font-bold">
            {dailyCompletedOrders}/{dailyOrders}
          </p>
        </div>
        <div className="frosted p-4 rounded-xl text-center">
          <FaChartLine className="text-2xl text-cyan-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Commission</p>
          <p className="text-white font-bold">{commission}%</p>
        </div>
      </div>
      <div className="frosted p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Daily Order Progress</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            canWithdraw
              ? 'bg-green-500/20 text-green-400'
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            {canWithdraw ? 'Withdrawal Available' : 'Complete Daily Orders'}
          </div>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                canWithdraw
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{
                width: `${Math.min((dailyCompletedOrders / dailyOrders) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{dailyCompletedOrders} completed</span>
            <span className="text-gray-400">{dailyOrders} required</span>
          </div>
        </div>
        {!canWithdraw && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-300 text-sm">
              <strong>Withdrawal Requirements:</strong> You need to complete {dailyOrders - dailyCompletedOrders} more orders today to unlock withdrawals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterSummary;
