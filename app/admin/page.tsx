"use client";

import React, { useState, useEffect } from "react";
import { FaUsers, FaWallet, FaTasks, FaChartLine, FaHistory, FaSync, FaCheck, FaTimes, FaClock, FaEdit, FaTrash, FaIdCard, FaUndo } from "react-icons/fa";
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { formatUserDisplay, formatTransactionDisplay } from '../utils/userFormatter';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [allDeposits, setAllDeposits] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showDepositHistory, setShowDepositHistory] = useState(false);
  const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(false);
  // --- FILTER STATE ---
  const [depositFilter, setDepositFilter] = useState({ user: '', status: '', counter: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', sort: 'desc' });
  const [withdrawalFilter, setWithdrawalFilter] = useState({ user: '', status: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', sort: 'desc' });
  const [userFilter, setUserFilter] = useState({ search: '', status: '', sort: 'desc', sortBy: 'userNumber' });
  // --- RESET STATE ---
  const [isResetting, setIsResetting] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // --- RESET HANDLERS ---
  const handleReset = async (type: 'all' | 'tasks' | 'commissions' | 'history', userId?: string) => {
    setIsResetting(true);
    setResetMessage('');
    try {
      let body: any = { resetType: type };
      if (userId) body.userId = parseInt(userId);
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setResetMessage('✅ Reset successful!');
      } else {
        setResetMessage('❌ Reset failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      const err = e as Error;
      setResetMessage('❌ Reset failed: ' + (err.message || String(e)));
    } finally {
      setIsResetting(false);
    }
  };

  // Handle additional deposit actions
  const handleDepositAdditionalAction = async (transactionId: string, action: 'freeze' | 'unfreeze' | 'delete') => {
    try {
      setIsSyncing(true);
      
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
          return;
        }
        
        const res = await fetch("/api/deposit", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
        });
        
        if (res.ok) {
          fetchAllDeposits();
          fetchUsers();
        }
      } else {
        const res = await fetch("/api/deposit", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, action }),
        });
        
        if (res.ok) {
          fetchAllDeposits();
          fetchUsers();
        }
      }
    } catch (e: any) {
      console.error("Failed to process deposit action:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle additional withdrawal actions
  const handleWithdrawalAdditionalAction = async (transactionId: string, action: 'freeze' | 'unfreeze' | 'delete') => {
    try {
      setIsSyncing(true);
      
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
          return;
        }
        
        const res = await fetch("/api/withdrawal", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId }),
        });
        
        if (res.ok) {
          fetchAllWithdrawals();
          fetchUsers();
        }
      } else {
        const res = await fetch("/api/withdrawal", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId, action }),
        });
        
        if (res.ok) {
          fetchAllWithdrawals();
          fetchUsers();
        }
      }
    } catch (e: any) {
      console.error("Failed to process withdrawal action:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = async () => {
    if (!editingTransaction || !editAmount) return;
    
    try {
      setIsSyncing(true);
      
      const endpoint = editingTransaction.type === 'deposit' ? '/api/deposit' : '/api/withdrawal';
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionId: editingTransaction.id, 
          amount: editAmount,
          description: editDescription
        }),
      });
      
      if (res.ok) {
        setEditingTransaction(null);
        setEditAmount('');
        setEditDescription('');
        fetchAllDeposits();
        fetchAllWithdrawals();
        fetchUsers();
      }
    } catch (e: any) {
      console.error("Failed to edit transaction:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Start editing a transaction
  const startEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description || '');
  };
  
  // Get status color for transactions
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'denied': return 'text-red-400';
      case 'frozen': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colorClass = getStatusColor(status);
    const bgColorClass = status === 'pending' ? 'bg-yellow-900/30' :
                        status === 'approved' ? 'bg-green-900/30' :
                        status === 'denied' ? 'bg-red-900/30' :
                        status === 'frozen' ? 'bg-blue-900/30' : 'bg-gray-900/30';
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass} ${bgColorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  // Fetch all users from the database
  const fetchUsers = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch users");
    }
    setIsSyncing(false);
    setLoading(false);
  };
  // Fetch all deposits
  const fetchAllDeposits = async () => {
    try {
      const res = await fetch("/api/deposit");
      const data = await res.json();
      if (data.success) {
        setAllDeposits(data.allDeposits);
      }
    } catch (e: any) {
      console.error("Failed to fetch deposits:", e);
    }
  };  // Fetch all withdrawals
  const fetchAllWithdrawals = async () => {
    try {
      const res = await fetch("/api/withdrawal");
      const data = await res.json();
      if (data.success) {
        setAllWithdrawals(data.allWithdrawals);
      }
    } catch (e: any) {
      console.error("Failed to fetch withdrawals:", e);
    }
  };
  // Handle withdrawal approval/denial
  const handleWithdrawalAction = async (groupedWithdrawal: any, action: 'approve' | 'deny') => {
    try {
      setIsSyncing(true);
      
      // Process all transactions for this user
      for (const transaction of groupedWithdrawal.transactions) {
        const res = await fetch("/api/withdrawal", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: transaction.id, action }),
        });
        
        if (!res.ok) {
          console.error(`Failed to ${action} transaction ${transaction.id}`);
        }
      }
      
      fetchAllWithdrawals(); // Refresh the list
      fetchUsers(); // Refresh user data to show updated balances
    } catch (e: any) {
      console.error("Failed to process withdrawal:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle deposit approval/denial
  const handleDepositAction = async (transactionId: string, action: 'approve' | 'deny') => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/deposit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });
      
      if (res.ok) {        fetchAllDeposits(); // Refresh the list
        fetchUsers(); // Refresh user data to show updated balances
      }
    } catch (e: any) {
      console.error("Failed to process deposit:", e);
    } finally {
      setIsSyncing(false);
    }
  };  useEffect(() => {
    fetchUsers();
    fetchAllDeposits();
    fetchAllWithdrawals();
  }, []);useRealtimeUpdates((event) => {
    if (event.type === 'user') {
      setUsers(event.payload);
    }
    if (event.type === 'currency') {
      // Optionally: setCurrencies(event.payload);
      fetchUsers(); // Or trigger a refresh if needed
    }
    if (event.type === 'counter') {
      // Optionally: setCounters(event.payload);
      fetchUsers(); // Or trigger a refresh if needed
    }
    if (event.type === 'deposit_created') {
      fetchAllDeposits(); // Refresh pending deposits when new one is created
    }
    if (event.type === 'deposit_approved' || event.type === 'deposit_denied') {
      fetchAllDeposits(); // Refresh pending deposits when one is processed
      fetchUsers(); // Refresh user data to show updated balances
    }    if (event.type === 'withdrawal_created') {
      fetchAllWithdrawals(); // Refresh pending withdrawals when new one is created
    }
    if (event.type === 'commission_withdrawal_created') {
      fetchAllWithdrawals(); // Refresh pending withdrawals when new commission withdrawal is created
    }
    if (event.type === 'withdrawal_approved' || event.type === 'withdrawal_denied') {
      fetchAllWithdrawals(); // Refresh pending withdrawals when one is processed
      fetchUsers(); // Refresh user data to show updated balances
    }
    if (event.type === 'commission_withwithdrawal_approved' || event.type === 'commission_withdrawal_denied') {
      fetchAllWithdrawals(); // Refresh pending withdrawals when commission withdrawal is processed
      fetchUsers(); // Refresh user data to show updated balances/earnings
    }
  });
  // Helper function to get counter balance breakdown
  const getCounterBalanceBreakdown = (user: any) => {
    if (!Array.isArray(user.counters)) return '';
    
    const activeCounters = user.counters
      .filter((c: any) => c.balance !== 0)
      .map((c: any) => `C${c.counterId}: $${c.balance.toFixed(2)}`)
      .join(', ');
    
    return activeCounters ? ` (${activeCounters})` : '';
  };  // Group pending withdrawals by user
  const groupPendingWithdrawals = () => {
    const pendingWithdrawals = allWithdrawals.filter((w: any) => w.status === 'pending');
    const grouped = new Map();
    
    pendingWithdrawals.forEach((withdrawal: any) => {
      const userId = withdrawal.userId;
      if (!grouped.has(userId)) {
        grouped.set(userId, {
          userId,
          user: withdrawal.user,
          transactions: [],
          totalAmount: 0,
          createdAt: withdrawal.createdAt
        });
      }
      
      const group = grouped.get(userId);
      group.transactions.push(withdrawal);
      group.totalAmount += withdrawal.amount;
      
      // Use the earliest transaction date
      if (new Date(withdrawal.createdAt) < new Date(group.createdAt)) {
        group.createdAt = withdrawal.createdAt;
      }
    });
    
    return Array.from(grouped.values());
  };

  // Group withdrawal history by user and withdrawal request (within 5-minute window)
  const groupWithdrawalHistory = () => {
    const completedWithdrawals = allWithdrawals.filter((w: any) => w.status === 'approved' || w.status === 'denied');
    const grouped = new Map();
    
    completedWithdrawals.forEach((withdrawal: any) => {
      const userId = withdrawal.userId;
      const createdTime = new Date(withdrawal.createdAt);
      
      // Find existing group within 5-minute window for same user
      let groupKey = `${userId}_${createdTime.getTime()}`;
      let existingGroup = null;
      
      for (const [key, group] of grouped.entries()) {
        if (key.startsWith(`${userId}_`)) {
          const groupTime = new Date(group.createdAt);
          const timeDiff = Math.abs(createdTime.getTime() - groupTime.getTime());
          
          // If within 5 minutes, group together
          if (timeDiff <= 5 * 60 * 1000) {
            existingGroup = group;
            groupKey = key;
            break;
          }
        }
      }
      
      if (!existingGroup) {
        grouped.set(groupKey, {
          userId,
          user: withdrawal.user,
          transactions: [],
          totalAmount: 0,
          createdAt: withdrawal.createdAt,
          status: withdrawal.status,
          hasMultipleStatuses: false
        });
        existingGroup = grouped.get(groupKey);
      }
      
      existingGroup.transactions.push(withdrawal);
      existingGroup.totalAmount += withdrawal.amount;
      
      // Track if there are multiple statuses in this group
      if (existingGroup.status !== withdrawal.status) {
        existingGroup.hasMultipleStatuses = true;
      }
      
      // Use the earliest transaction date
      if (new Date(withdrawal.createdAt) < new Date(existingGroup.createdAt)) {
        existingGroup.createdAt = withdrawal.createdAt;
      }
    });
    
    return Array.from(grouped.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());  };
  
  const pendingWithdrawals = groupPendingWithdrawals();
  const groupedWithdrawalHistory = groupWithdrawalHistory();

  // Aggregate statistics
  const totalUsers = users.length;
  const totalBalance = users.reduce((sum: number, u: any) => sum + (u.totalBalance || 0), 0);
  const totalEarnings = users.reduce((sum: number, u: any) => sum + ((Array.isArray(u.counters) ? u.counters : []).reduce((s: number, c: any) => s + (c.totalEarnings || 0), 0)), 0);
  const totalTasks = users.reduce((sum: number, u: any) => sum + ((Array.isArray(u.counters) ? u.counters : []).reduce((s: number, c: any) => s + (c.completedTasks || 0), 0)), 0);

  // --- FILTER LOGIC ---
  const filteredDeposits = allDeposits.filter((deposit: any) => {
    if (depositFilter.status && deposit.status !== depositFilter.status) return false;
    if (depositFilter.user && !(deposit.user.firstName + ' ' + deposit.user.lastName + ' ' + deposit.user.email).toLowerCase().includes(depositFilter.user.toLowerCase())) return false;
    if (depositFilter.counter && String(deposit.counterId) !== depositFilter.counter) return false;
    if (depositFilter.minAmount && deposit.amount < parseFloat(depositFilter.minAmount)) return false;
    if (depositFilter.maxAmount && deposit.amount > parseFloat(depositFilter.maxAmount)) return false;
    if (depositFilter.startDate && new Date(deposit.createdAt) < new Date(depositFilter.startDate)) return false;
    if (depositFilter.endDate && new Date(deposit.createdAt) > new Date(depositFilter.endDate)) return false;
    return true;
  }).sort((a: any, b: any) => depositFilter.sort === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const filteredWithdrawalHistory = groupedWithdrawalHistory.filter((group: any) => {
    if (withdrawalFilter.status && group.status !== withdrawalFilter.status) return false;
    if (withdrawalFilter.user && !(group.user.firstName + ' ' + group.user.lastName + ' ' + group.user.email).toLowerCase().includes(withdrawalFilter.user.toLowerCase())) return false;
    if (withdrawalFilter.minAmount && group.totalAmount < parseFloat(withdrawalFilter.minAmount)) return false;
    if (withdrawalFilter.maxAmount && group.totalAmount > parseFloat(withdrawalFilter.maxAmount)) return false;
    if (withdrawalFilter.startDate && new Date(group.createdAt) < new Date(withdrawalFilter.startDate)) return false;
    if (withdrawalFilter.endDate && new Date(group.createdAt) > new Date(withdrawalFilter.endDate)) return false;
    return true;
  }).sort((a: any, b: any) => withdrawalFilter.sort === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const filteredUsers = users.filter((u: any) => {
    if (userFilter.status) {
      if (userFilter.status === 'active' && (u.banned || u.frozen)) return false;
      if (userFilter.status === 'banned' && !u.banned) return false;
      if (userFilter.status === 'frozen' && !u.frozen) return false;
    }
    if (userFilter.search && !(u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(userFilter.search.toLowerCase())) return false;
    return true;
  }).sort((a: any, b: any) => {
    if (userFilter.sortBy === 'userNumber') {
      return userFilter.sort === 'desc' ? b.id - a.id : a.id - b.id;
    } else if (userFilter.sortBy === 'balance') {
      return userFilter.sort === 'desc' ? (b.totalBalance || 0) - (a.totalBalance || 0) : (a.totalBalance || 0) - (b.totalBalance || 0);
    } else if (userFilter.sortBy === 'earnings') {
      const aEarn = (Array.isArray(a.counters) ? a.counters : []).reduce((s: number, c: any) => s + (c.totalEarnings || 0), 0);
      const bEarn = (Array.isArray(b.counters) ? b.counters : []).reduce((s: number, c: any) => s + (c.totalEarnings || 0), 0);
      return userFilter.sort === 'desc' ? bEarn - aEarn : aEarn - bEarn;
    } else if (userFilter.sortBy === 'tasks') {
      const aTasks = (Array.isArray(a.counters) ? a.counters : []).reduce((s: number, c: any) => s + (c.completedTasks || 0), 0);
      const bTasks = (Array.isArray(b.counters) ? b.counters : []).reduce((s: number, c: any) => s + (c.completedTasks || 0), 0);
      return userFilter.sort === 'desc' ? bTasks - aTasks : aTasks - bTasks;
    }
    return 0;
  });

  // Split grouped withdrawal history into denied and approved
  const deniedWithdrawalGroups = filteredWithdrawalHistory.filter((group: any) => group.status === 'denied');
  const approvedWithdrawalGroups = filteredWithdrawalHistory.filter((group: any) => group.status === 'approved');

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Admin Error</h1>
        <p className="mb-4 text-red-400">{error}</p>
        <button className="px-4 py-2 bg-blue-600 rounded" onClick={fetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-5xl mx-auto pt-24 pb-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-2">
            <a href="/admin/currencies" className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">Currencies</a>
            <a href="/admin/counters" className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition">Counters</a>
            <button
              onClick={fetchUsers}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-all disabled:opacity-50"
              disabled={isSyncing}
            >
              <FaSync className={isSyncing ? "animate-spin mr-2" : "mr-2"} />
              {isSyncing ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="frosted p-4 rounded-xl text-center">
            <FaUsers className="text-2xl text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-white font-bold">{totalUsers}</p>
          </div>
          <div className="frosted p-4 rounded-xl text-center">
            <FaWallet className="text-2xl text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total Balance</p>
            <p className="text-white font-bold">${totalBalance.toFixed(2)}</p>
          </div>
          <div className="frosted p-4 rounded-xl text-center">
            <FaTasks className="text-2xl text-purple-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-white font-bold">{totalTasks}</p>
          </div>
          <div className="frosted p-4 rounded-xl text-center">
            <FaChartLine className="text-2xl text-yellow-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-white font-bold">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>        {/* Pending Deposits */}
        <div className="frosted p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center">
              <FaClock className="mr-2 text-yellow-400" />
              Pending Deposits ({allDeposits.filter((d: any) => d.status === 'pending').length})
            </h2>
            <button
              onClick={fetchAllDeposits}
              className="flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow transition-all text-sm"
            >
              <FaSync className="mr-1" />
              Refresh
            </button>
          </div>
          
          {allDeposits.filter((d: any) => d.status === 'pending').length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No pending deposits at the moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-400">
                <thead>
                  <tr>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Counter</th>
                    <th className="px-4 py-2">Payment Method</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDeposits.filter((d: any) => d.status === 'pending').map((deposit: any) => (
                    <tr key={deposit.id} className="bg-gray-800/40 border-b border-gray-700">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">
                            {deposit.user.firstName} {deposit.user.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{deposit.user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-bold">${deposit.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-blue-400">Counter {deposit.counterId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300">{deposit.description}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-xs">
                          {new Date(deposit.createdAt).toLocaleString()}
                        </span>
                      </td>                      <td className="px-4 py-3">
                        <div className="flex space-x-1 flex-wrap">
                          <button
                            onClick={() => handleDepositAction(deposit.id, 'approve')}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaCheck className="mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDepositAction(deposit.id, 'deny')}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaTimes className="mr-1" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleDepositAdditionalAction(deposit.id, 'freeze')}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaClock className="mr-1" />
                            Freeze
                          </button>
                          <button
                            onClick={() => startEditTransaction(deposit)}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDepositAdditionalAction(deposit.id, 'delete')}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}        </div>
        
        {/* Pending Withdrawals */}
        <div className="frosted p-6 rounded-xl mb-8">          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center">
              <FaClock className="mr-2 text-orange-400" />
              Pending Withdrawals ({pendingWithdrawals.length})
            </h2>
            <button
              onClick={fetchAllWithdrawals}
              className="flex items-center px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow transition-all text-sm"
            >
              <FaSync className="mr-1" />
              Refresh
            </button>
          </div>
          
          {pendingWithdrawals.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No pending withdrawals at the moment.
            </div>
          ) : (
            <div className="overflow-x-auto">              <table className="min-w-full text-sm text-left text-gray-400">                <thead>
                  <tr>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Total Amount</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>                  {pendingWithdrawals.map((groupedWithdrawal: any) => (
                    <tr key={groupedWithdrawal.userId} className="bg-gray-800/40 border-b border-gray-700">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">
                            {groupedWithdrawal.user.firstName} {groupedWithdrawal.user.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{groupedWithdrawal.user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-orange-400 font-bold">${groupedWithdrawal.totalAmount.toFixed(2)}</span>
                        <div className="text-xs text-gray-400 mt-1">
                          {groupedWithdrawal.transactions.length} withdrawal request(s)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300">Bank Transfer</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-xs">
                          {new Date(groupedWithdrawal.createdAt).toLocaleString()}
                        </span>
                      </td>                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleWithdrawalAction(groupedWithdrawal, 'approve')}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaCheck className="mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(groupedWithdrawal, 'deny')}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaTimes className="mr-1" />
                            Deny
                          </button>
                          {/* Additional actions for individual transactions */}
                          {groupedWithdrawal.transactions.map((transaction: any) => (
                            <div key={transaction.id} className="flex gap-1">
                              <button
                                onClick={() => handleWithdrawalAdditionalAction(transaction.id, 'freeze')}
                                disabled={isSyncing}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                                title="Freeze Transaction"
                              >
                                <FaClock className="mr-1" />
                                Freeze
                              </button>
                              <button
                                onClick={() => startEditTransaction(transaction)}
                                disabled={isSyncing}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                                title="Edit Transaction"
                              >
                                <FaEdit className="mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleWithdrawalAdditionalAction(transaction.id, 'delete')}
                                disabled={isSyncing}
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                                title="Delete Transaction"
                              >
                                <FaTrash className="mr-1" />
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}        </div>

        {/* Deposit History */}
        <div className="frosted p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center">
              <FaHistory className="mr-2 text-blue-400" />
              Deposit History ({allDeposits.length})
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDepositHistory(!showDepositHistory)}
                className={`flex items-center px-3 py-1 rounded-lg shadow transition-all text-sm ${showDepositHistory ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
              >
                {showDepositHistory ? 'Hide' : 'Show'} History
              </button>
              <button
                onClick={fetchAllDeposits}
                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-all text-sm"
              >
                <FaSync className="mr-1" />
                Refresh
              </button>
            </div>
          </div>
          
          {showDepositHistory && (
            <>
              <div className="mb-2 flex flex-wrap gap-2 items-center">
                <input type="text" placeholder="User name/email" value={depositFilter.user} onChange={e => setDepositFilter(f => ({ ...f, user: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs" />
                <select value={depositFilter.status} onChange={e => setDepositFilter(f => ({ ...f, status: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="frozen">Frozen</option>
                </select>
                <input type="number" placeholder="Min $" value={depositFilter.minAmount} onChange={e => setDepositFilter(f => ({ ...f, minAmount: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs w-20" />
                <input type="number" placeholder="Max $" value={depositFilter.maxAmount} onChange={e => setDepositFilter(f => ({ ...f, maxAmount: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs w-20" />
                <input type="text" placeholder="Counter #" value={depositFilter.counter} onChange={e => setDepositFilter(f => ({ ...f, counter: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs w-20" />
                <input type="date" value={depositFilter.startDate} onChange={e => setDepositFilter(f => ({ ...f, startDate: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs" />
                <input type="date" value={depositFilter.endDate} onChange={e => setDepositFilter(f => ({ ...f, endDate: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs" />
                <button onClick={() => setDepositFilter(f => ({ ...f, sort: f.sort === 'desc' ? 'asc' : 'desc' }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">Sort: {depositFilter.sort === 'desc' ? 'Newest' : 'Oldest'}</button>
                <button onClick={() => setDepositFilter({ user: '', status: '', counter: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', sort: 'desc' })} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">Reset</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Counter</th>
                      <th className="px-4 py-2">Payment Method</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((deposit: any) => (
                      <tr key={deposit.id} className="bg-gray-800/40 border-b border-gray-700">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-white">
                              {deposit.user.firstName} {deposit.user.lastName}
                            </div>
                            <div className="text-xs text-gray-400">{deposit.user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-400 font-bold">${deposit.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-blue-400">Counter {deposit.counterId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">{deposit.description}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-xs">
                            {new Date(deposit.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1 flex-wrap">
                            <button
                              onClick={() => handleDepositAdditionalAction(deposit.id, 'delete')}
                              disabled={isSyncing}
                              className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="frosted p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">            <h2 className="text-lg font-bold text-white flex items-center">
              <FaHistory className="mr-2 text-purple-400" />
              Withdrawal History ({groupWithdrawalHistory().length} groups, {allWithdrawals.length} total transactions)
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowWithdrawalHistory(!showWithdrawalHistory)}
                className={`flex items-center px-3 py-1 rounded-lg shadow transition-all text-sm ${showWithdrawalHistory ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
              >
                {showWithdrawalHistory ? 'Hide' : 'Show'} History
              </button>
              <button
                onClick={fetchAllWithdrawals}
                className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition-all text-sm"
              >
                <FaSync className="mr-1" />
                Refresh
              </button>
            </div>
          </div>
          {showWithdrawalHistory && (
            <>
              <div className="mb-2 flex flex-wrap gap-2 items-center">
                <input type="text" placeholder="User name/email" value={withdrawalFilter.user} onChange={e => setWithdrawalFilter(f => ({ ...f, user: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs" />
                <select value={withdrawalFilter.status} onChange={e => setWithdrawalFilter(f => ({ ...f, status: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="frozen">Frozen</option>
                </select>
                <input type="number" placeholder="Min $" value={withdrawalFilter.minAmount} onChange={e => setWithdrawalFilter(f => ({ ...f, minAmount: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs w-20" />
                <input type="number" placeholder="Max $" value={withdrawalFilter.maxAmount} onChange={e => setWithdrawalFilter(f => ({ ...f, maxAmount: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs w-20" />
                <input type="date" value={withdrawalFilter.startDate} onChange={e => setWithdrawalFilter(f => ({ ...f, startDate: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs" />
                <input type="date" value={withdrawalFilter.endDate} onChange={e => setWithdrawalFilter(f => ({ ...f, endDate: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs" />
                <button onClick={() => setWithdrawalFilter(f => ({ ...f, sort: f.sort === 'desc' ? 'asc' : 'desc' }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">Sort: {withdrawalFilter.sort === 'desc' ? 'Newest' : 'Oldest'}</button>
                <button onClick={() => setWithdrawalFilter({ user: '', status: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', sort: 'desc' })} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">Reset</button>
              </div>
              {/* Denied Withdrawals */}
              <h3 className="text-red-400 font-bold mt-6 mb-2">Denied Withdrawals</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full text-sm text-left text-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Total Amount</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deniedWithdrawalGroups.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-4">No denied withdrawals.</td></tr>
                    ) : deniedWithdrawalGroups.map((groupedWithdrawal: any) => (
                      <tr key={groupedWithdrawal.userId + groupedWithdrawal.createdAt} className="bg-gray-800/40 border-b border-gray-700">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-white">
                              {groupedWithdrawal.user.firstName} {groupedWithdrawal.user.lastName}
                            </div>
                            <div className="text-xs text-gray-400">{groupedWithdrawal.user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-orange-400 font-bold">${groupedWithdrawal.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge('denied')}</td>
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-xs">{new Date(groupedWithdrawal.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              if (confirm(`Delete all ${groupedWithdrawal.transactions.length} transaction(s) in this denied group?`)) {
                                groupedWithdrawal.transactions.forEach((tx: any) => {
                                  handleWithdrawalAdditionalAction(tx.id, 'delete');
                                });
                              }
                            }}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaTrash className="mr-1" />
                            Delete Group
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Approved Withdrawals */}
              <h3 className="text-green-400 font-bold mt-6 mb-2">Approved Withdrawals</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Total Amount</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedWithdrawalGroups.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-4">No approved withdrawals.</td></tr>
                    ) : approvedWithdrawalGroups.map((groupedWithdrawal: any) => (
                      <tr key={groupedWithdrawal.userId + groupedWithdrawal.createdAt} className="bg-gray-800/40 border-b border-gray-700">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-white">
                              {groupedWithdrawal.user.firstName} {groupedWithdrawal.user.lastName}
                            </div>
                            <div className="text-xs text-gray-400">{groupedWithdrawal.user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-orange-400 font-bold">${groupedWithdrawal.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge('approved')}</td>
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-xs">{new Date(groupedWithdrawal.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              if (confirm(`Delete all ${groupedWithdrawal.transactions.length} transaction(s) in this approved group?`)) {
                                groupedWithdrawal.transactions.forEach((tx: any) => {
                                  handleWithdrawalAdditionalAction(tx.id, 'delete');
                                });
                              }
                            }}
                            disabled={isSyncing}
                            className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs transition-colors disabled:opacity-50 flex items-center"
                          >
                            <FaTrash className="mr-1" />
                            Delete Group
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-4">
                Edit {editingTransaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Transaction
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleEditTransaction}
                  disabled={isSyncing || !editAmount}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSyncing ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingTransaction(null);
                    setEditAmount('');
                    setEditDescription('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* User List */}
        <div className="frosted p-6 rounded-xl mb-8">
          <h2 className="text-lg font-bold text-white mb-4">User List</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <input type="text" placeholder="Search name/email" className="px-2 py-1 rounded bg-gray-700 text-white" value={userFilter.search} onChange={e => setUserFilter(f => ({ ...f, search: e.target.value }))} />
            <select className="px-2 py-1 rounded bg-gray-700 text-white" value={userFilter.status} onChange={e => setUserFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="frozen">Frozen</option>
            </select>
            <select className="px-2 py-1 rounded bg-gray-700 text-white" value={userFilter.sortBy} onChange={e => setUserFilter(f => ({ ...f, sortBy: e.target.value }))}>
              <option value="userNumber">User #</option>
              <option value="balance">Balance</option>
              <option value="earnings">Earnings</option>
              <option value="tasks">Tasks</option>
            </select>
            <button onClick={() => setUserFilter(f => ({ ...f, sort: f.sort === 'desc' ? 'asc' : 'desc' }))} className="px-2 py-1 rounded bg-gray-700 text-white text-xs">Sort: {userFilter.sort === 'desc' ? 'High→Low' : 'Low→High'}</button>
            <button
              className="px-4 py-2 bg-green-700 text-white rounded-lg shadow hover:bg-green-800"
              onClick={async () => {
                const email = prompt('Email?');
                const password = prompt('Password?');
                const firstName = prompt('First name?');
                const lastName = prompt('Last name?');
                if (email && password) {
                  setIsSyncing(true);
                  await fetch('/api/admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'add', email, password, firstName, lastName }),
                  });
                  fetchUsers();
                }
              }}
            >Add User</button>
          </div>
          {loading ? (
            <div className="text-gray-400">Loading users...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-400">
                <thead>
                  <tr>
                    <th className="px-4 py-2">User #</th>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Balance</th>
                    <th className="px-4 py-2">Earnings</th>
                    <th className="px-4 py-2">Tasks</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>                <tbody>
                  {filteredUsers.map((u: any) => {
                    const userDisplay = formatUserDisplay(u);
                    return (
                    <tr key={u.id} className="bg-gray-800/40">
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-mono">
                          <FaIdCard className="mr-1" />
                          {userDisplay.userNumber}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium text-white">{userDisplay.fullName}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className="text-green-400 font-bold">${u.totalBalance?.toFixed(2) ?? '0.00'}</span>
                      </td>
                      <td className="px-4 py-2">${((Array.isArray(u.counters) ? u.counters : []).reduce((s: number, c: any) => s + (c.totalEarnings || 0), 0)).toFixed(2)}</td>
                      <td className="px-4 py-2">{(Array.isArray(u.counters) ? u.counters : []).reduce((s: number, c: any) => s + (c.completedTasks || 0), 0)}</td>
                      <td className="px-4 py-2">
                        {u.banned ? <span className="text-red-400">Banned</span> : u.frozen ? <span className="text-blue-400">Frozen</span> : <span className="text-green-400">Active</span>}
                      </td>
                      <td className="px-4 py-2 flex flex-wrap gap-1">
                        <button className="px-2 py-1 bg-red-700 text-white rounded hover:bg-red-800" onClick={async () => { if(confirm('Delete user?')) { setIsSyncing(true); await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', userId: u.id }) }); fetchUsers(); } }}>Delete</button>
                        {u.banned ? (
                          <button className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800" onClick={async () => { setIsSyncing(true); await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unban', userId: u.id }) }); fetchUsers(); }}>Unban</button>
                        ) : (
                          <button className="px-2 py-1 bg-yellow-700 text-white rounded hover:bg-yellow-800" onClick={async () => { setIsSyncing(true); await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ban', userId: u.id }) }); fetchUsers(); }}>Ban</button>
                        )}
                        {u.frozen ? (
                          <button className="px-2 py-1 bg-green-700 text-white rounded hover:bg-green-800" onClick={async () => { setIsSyncing(true); await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unfreeze', userId: u.id }) }); fetchUsers(); }}>Unfreeze</button>
                        ) : (
                          <button className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={async () => { setIsSyncing(true); await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'freeze', userId: u.id }) }); fetchUsers(); }}>Freeze</button>
                        )}
                        <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800" onClick={async () => { const firstName = prompt('New first name?', u.firstName); const lastName = prompt('New last name?', u.lastName); if(firstName !== null && lastName !== null) { setIsSyncing(true); await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', userId: u.id, update: { firstName, lastName } }) }); fetchUsers(); } }}>Edit</button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Recent Activity (all users) */}
        <div className="frosted p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          {loading ? (
            <div className="text-gray-400">Loading activity...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="space-y-2">
              {users.flatMap((u: any) => ((Array.isArray(u.transactions) ? u.transactions : []).map((tx: any) => ({ ...tx, user: u }))))

                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 12)
                .map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()} &mdash; {tx.user.firstName} {tx.user.lastName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-green-400 font-bold">${tx.amount?.toFixed(2) ?? '0.00'}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Reset Functions Panel */}
        <div className="frosted p-6 rounded-xl mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Reset Functions</h2>
          <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">Select User (for user-specific reset):</label>
              <select
                value={resetUserId}
                onChange={e => setResetUserId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- All Users (global reset) --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    #{user.id} - {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-end">
              <button
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold mr-2 disabled:opacity-50"
                disabled={isResetting}
                onClick={() => handleReset('all', resetUserId || undefined)}
              >
                Reset All Data
              </button>
              <button
                className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg font-bold mr-2 disabled:opacity-50"
                disabled={isResetting}
                onClick={() => handleReset('tasks', resetUserId || undefined)}
              >
                Reset Tasks
              </button>
              <button
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-bold mr-2 disabled:opacity-50"
                disabled={isResetting}
                onClick={() => handleReset('commissions', resetUserId || undefined)}
              >
                Reset Commissions
              </button>
              <button
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold disabled:opacity-50"
                disabled={isResetting || !resetUserId}
                onClick={() => handleReset('history', resetUserId)}
              >
                Reset History (User)
              </button>
            </div>
          </div>
          {resetMessage && <div className="mt-2 text-white font-bold">{resetMessage}</div>}
        </div>
      </div>
    </div>
  );
}