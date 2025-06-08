'use client';
import React, { useState, useEffect } from 'react';
import { useMoneyExchange } from '../contexts/MoneyExchangeContext';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useRouter } from 'next/navigation';
import { getUserSession } from '../utils/session';

const WithdrawalPage = () => {
  const { state, dispatch } = useMoneyExchange();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);  // Get user ID from session and set up real-time updates
  useEffect(() => {
    const session = getUserSession();
    const userId = session?.id || null;
    setCurrentUserId(userId);
    if (userId) {
      fetchUserTransactions(userId);
    }
  }, []);
  // Listen for real-time updates
  useRealtimeUpdates((event) => {
    if ((event.type === 'withdrawal_approved' || event.type === 'commission_withdrawal_approved') && event.payload.userId?.toString() === currentUserId) {
      setWithdrawalStatus('approved');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/dashboard');
      }, 2000);
      if (currentUserId) {
        fetchUserTransactions(currentUserId);
      }
    } else if ((event.type === 'withdrawal_denied' || event.type === 'commission_withdrawal_denied') && event.payload.userId?.toString() === currentUserId) {
      setWithdrawalStatus('denied');
      setTimeout(() => {
        setWithdrawalStatus('');
      }, 3000);
      if (currentUserId) {
        fetchUserTransactions(currentUserId);
      }
    }
  });  // Fetch user's withdrawal transactions
  const fetchUserTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/transactions`);
      if (response.ok) {
        const data = await response.json();
        const withdrawals = data.transactions?.filter((t: any) => 
          t.type === 'withdrawal' || t.type === 'commission_withdrawal'
        ) || [];
        setUserTransactions(withdrawals);
      }
    } catch (error) {
      console.error('Error fetching user transactions:', error);
    }
  };
  // Aggregate all counters' balances and commissions
  const counters = Object.entries(state.counters || {});
  const totalBalance = counters.reduce((sum, [_, c]) => sum + (c.balance || 0), 0);
  const totalCommission = counters.reduce((sum, [_, c]) => sum + (c.totalEarnings || 0), 0);
  const totalWithdrawable = totalBalance + totalCommission;
  const canWithdraw = counters.some(([_, c]) => c.balance > 0 || c.totalEarnings > 0);

  const handleWithdrawAll = () => {
    setShowConfirm(true);
  };  const confirmWithdraw = async () => {
    console.log('🔍 Debug - confirmWithdraw called');
    console.log('🔍 Debug - currentUserId:', currentUserId);
    console.log('🔍 Debug - counters:', counters);
    
    if (!currentUserId) {
      alert('Please log in to make a withdrawal');
      return;
    }

    setIsProcessing(true);
    setWithdrawalStatus('pending');

    try {
      // Create combined withdrawal request for each counter that has balance or commission
      for (const [counterId, counter] of counters) {
        const totalBalance = counter.balance || 0;
        const totalCommission = counter.totalEarnings || 0;
        const totalWithdrawable = totalBalance + totalCommission;

        // Only create withdrawal if there's something to withdraw
        if (totalWithdrawable > 0) {
          console.log('🔍 Debug - Creating combined withdrawal for counter', counterId);
          console.log('🔍 Debug - Balance:', totalBalance, 'Commission:', totalCommission, 'Total:', totalWithdrawable);
          
          const requestBody = {
            userId: currentUserId,
            counterId: counterId,
            amount: totalWithdrawable,
            balanceAmount: totalBalance,
            commissionAmount: totalCommission,
            withdrawalType: 'combined',
            withdrawalMethod: 'Bank Transfer'
          };
          console.log('🔍 Debug - Request body:', requestBody);
          
          const response = await fetch('/api/withdrawal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          console.log('🔍 Debug - Combined withdrawal response status:', response.status);
          const responseData = await response.json();
          console.log('🔍 Debug - Combined withdrawal response data:', responseData);

          if (!response.ok) {
            throw new Error(`Failed to create withdrawal request: ${responseData.error || 'Unknown error'}`);
          }
        }
      }

      // Update local state to show pending
      setIsProcessing(false);
      setShowConfirm(false);
      
      // Refresh transactions
      fetchUserTransactions(currentUserId);
    } catch (error: any) {
      console.error('🔍 Debug - Error in confirmWithdraw:', error);
      console.error('🔍 Debug - Error message:', error.message);
      console.error('🔍 Debug - Error stack:', error.stack);
      setIsProcessing(false);
      setWithdrawalStatus('error');
      alert(`Failed to create withdrawal request: ${error.message}. Please try again.`);
    }
  };
  const getPendingWithdrawals = () => {
    return userTransactions.filter(t => t.status === 'pending');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'denied': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusMessage = () => {
    if (withdrawalStatus === 'pending') {
      return (
        <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
          <div className="flex items-center text-yellow-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
            <span>Withdrawal request submitted - Awaiting admin approval</span>
          </div>
        </div>
      );
    } else if (withdrawalStatus === 'denied') {
      return (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg">
          <div className="text-red-400">❌ Withdrawal request was denied</div>
        </div>
      );
    } else if (withdrawalStatus === 'error') {
      return (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg">
          <div className="text-red-400">❌ Error creating withdrawal request</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-gray-900/80 rounded-2xl shadow-2xl p-8 border border-gray-700 relative">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center tracking-tight">Withdraw Funds</h1>
          {/* Current Balance Display */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-400">Total Balance</span>
            <span className="text-2xl font-bold text-green-400">${totalBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-400">Total Commission</span>
            <span className="text-2xl font-bold text-blue-400">${totalCommission.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-white">Total Withdrawable</span>
              <span className="text-3xl font-bold text-yellow-400">${totalWithdrawable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pending Withdrawals Display */}
        {getPendingWithdrawals().length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <h3 className="text-yellow-400 font-semibold mb-2">Pending Withdrawals</h3>
            {getPendingWithdrawals().map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center text-sm text-gray-300">
                <span>${transaction.amount.toFixed(2)}</span>
                <span className="text-yellow-400">Pending Approval</span>
              </div>
            ))}
          </div>
        )}

        {/* Withdrawal Button */}
        <button
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${
            canWithdraw && !isProcessing && withdrawalStatus !== 'pending' 
              ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleWithdrawAll}
          disabled={!canWithdraw || isProcessing || withdrawalStatus === 'pending'}
        >          {isProcessing ? 'Processing...' : 
           withdrawalStatus === 'pending' ? 'Withdrawal Pending...' : 'Withdraw All Funds'}
        </button>

        {/* Status Messages */}
        {getStatusMessage()}
          {!canWithdraw && (
          <div className="mt-4 text-orange-400 text-center text-sm">
            No balance or commission available for withdrawal.
          </div>
        )}

        {/* Recent Withdrawals */}
        {userTransactions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-white font-semibold mb-3">Recent Withdrawals</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {userTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">${transaction.amount.toFixed(2)}</span>
                  <span className={getStatusColor(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-gray-700 animate-bounceIn">
              <h2 className="text-xl font-bold text-white mb-4 text-center">Confirm Withdrawal</h2>              <p className="text-gray-300 text-center mb-6">
                Submit withdrawal request for <span className="text-yellow-400 font-semibold">${totalWithdrawable.toFixed(2)}</span>?
                <br />
                <span className="text-sm text-gray-400">
                  (Balance: ${totalBalance.toFixed(2)} + Commission: ${totalCommission.toFixed(2)})
                </span>
                <br /><br />
                <span className="text-yellow-400 text-sm">⚠️ This will require admin approval</span>
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold hover:from-green-600 hover:to-blue-600 transition-all"
                  onClick={confirmWithdraw}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Yes, Request'}
                </button>
                <button
                  className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 font-bold hover:bg-gray-600 transition-all"
                  onClick={() => setShowConfirm(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-green-600 animate-bounceIn text-center">
              <svg className="mx-auto mb-4" width="48" height="48" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2"/>
                <path d="M8 12.5l2.5 2.5L16 9.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-xl font-bold text-green-400 mb-2">Withdrawal Approved!</h2>
              <p className="text-gray-300">Your withdrawal has been successfully processed.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalPage;
