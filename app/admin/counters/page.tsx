"use client";

import { FaSync } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

function CounterFormModal({ open, onClose, onSubmit, initial }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">{initial ? 'Edit Counter Level' : 'Add Counter Level'}</h2>
        <form ref={formRef} onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(formRef.current!);
          const values = Object.fromEntries(fd.entries());
          onSubmit(values);
        }}>
          <input name="name" defaultValue={initial?.name || ''} placeholder="Name" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <input name="minDeposit" type="number" step="any" defaultValue={initial?.minDeposit || ''} placeholder="Min Deposit" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <input name="dailyOrders" type="number" defaultValue={initial?.dailyOrders || ''} placeholder="Daily Orders" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <input name="commission" type="number" step="any" defaultValue={initial?.commission || ''} placeholder="Commission (%)" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <input name="exchangeAmountMin" type="number" step="any" defaultValue={initial?.exchangeAmountMin || ''} placeholder="Min Exchange Amount" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <input name="exchangeAmountMax" type="number" step="any" defaultValue={initial?.exchangeAmountMax || ''} placeholder="Max Exchange Amount" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <textarea name="description" defaultValue={initial?.description || ''} placeholder="Description" className="w-full mb-2 p-2 rounded bg-gray-800 text-white" required />
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="px-4 py-2 bg-gray-700 text-white rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded">{initial ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  const [counters, setCounters] = useState<any[]>([]);
  const [userCounters, setUserCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCounter, setEditCounter] = useState<any>(null);

  // Fetch counters from API
  const fetchCounters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin?type=counters");
      const data = await res.json();
      console.log('Fetched counters:', data); // DEBUG LOG
      if (data.success) {
        setCounters(data.counters);
        setUserCounters(data.userCounters || []);
      } else {
        setError(data.error || "Failed to fetch counters");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch counters");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  useRealtimeUpdates((event) => {
    if (event.type === 'counter') {
      if (Array.isArray(event.payload)) {
        setCounters(event.payload);
      } else {
        fetchCounters();
      }
    }
  });

  // Modal handlers
  const handleAddCounterModal = () => {
    setEditCounter(null);
    setShowModal(true);
  };
  const handleEditCounterModal = (counter: any) => {
    setEditCounter(counter);
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditCounter(null);
  };
  const handleModalSubmit = async (values: any) => {
    setIsSyncing(true);
    if (editCounter) {
      // Edit
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'editCounter',
          id: editCounter.id,
          name: values.name,
          minDeposit: Number(values.minDeposit),
          dailyOrders: Number(values.dailyOrders),
          commission: Number(values.commission),
          description: values.description,
          exchangeAmountMin: Number(values.exchangeAmountMin),
          exchangeAmountMax: Number(values.exchangeAmountMax),
        }),
      });
    } else {
      // Add
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addCounter',
          name: values.name,
          minDeposit: Number(values.minDeposit),
          dailyOrders: Number(values.dailyOrders),
          commission: Number(values.commission),
          description: values.description,
          exchangeAmountMin: Number(values.exchangeAmountMin),
          exchangeAmountMax: Number(values.exchangeAmountMax),
        }),
      });
    }
    setShowModal(false);
    setEditCounter(null);
    fetchCounters();
    setIsSyncing(false);
  };
  const handleDeleteCounter = async (id: any) => {
    if (confirm('Delete this counter level?')) {
      setIsSyncing(true);
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteCounter', id }),
      });
      fetchCounters();
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-5xl mx-auto pt-24 pb-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Counter Levels</h1>
          <div className="flex gap-2">
            <a href="/admin/currencies" className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">Currencies</a>
            <a href="/admin/counters" className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition">Counters</a>
            <button
              onClick={fetchCounters}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-all disabled:opacity-50"
              disabled={isSyncing}
            >
              <FaSync className={isSyncing ? "animate-spin mr-2" : "mr-2"} />
              {isSyncing ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className="frosted p-6 rounded-xl mb-8">
          <button
            className="mb-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            onClick={handleAddCounterModal}
            disabled={isSyncing}
          >Add Counter Level</button>
          <CounterFormModal open={showModal} onClose={handleModalClose} onSubmit={handleModalSubmit} initial={editCounter} />
          {loading ? (
            <div className="text-gray-400">Loading counters...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white mb-2 mt-4">Counter Levels</h3>
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full text-sm text-left text-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Min Deposit</th>
                      <th className="px-4 py-2">Daily Orders</th>
                      <th className="px-4 py-2">Commission (%)</th>
                      <th className="px-4 py-2">Min/Max Exchange</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counters.map((c) => (
                      <tr key={c.id} className="bg-gray-800/40">
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2">${c.minDeposit}</td>
                        <td className="px-4 py-2">{c.dailyOrders}</td>
                        <td className="px-4 py-2">{c.commission}</td>
                        <td className="px-4 py-2">${c.exchangeAmountMin} - ${c.exchangeAmountMax}</td>
                        <td className="px-4 py-2 flex gap-1">
                          <button className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={() => handleEditCounterModal(c)}>Edit</button>
                          <button className="px-2 py-1 bg-red-700 text-white rounded hover:bg-red-800" onClick={() => handleDeleteCounter(c.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 mt-4">User Counters</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">User ID</th>
                      <th className="px-4 py-2">Counter Level ID</th>
                      <th className="px-4 py-2">Balance</th>
                      <th className="px-4 py-2">Total Earnings</th>
                      <th className="px-4 py-2">Completed Tasks</th>
                      <th className="px-4 py-2">Active</th>
                      <th className="px-4 py-2">Can Withdraw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCounters.map((uc) => (
                      <tr key={uc.id} className="bg-gray-800/40">
                        <td className="px-4 py-2">{uc.userId}</td>
                        <td className="px-4 py-2">{uc.counterId}</td>
                        <td className="px-4 py-2">${uc.balance}</td>
                        <td className="px-4 py-2">${uc.totalEarnings}</td>
                        <td className="px-4 py-2">{uc.completedTasks}</td>
                        <td className="px-4 py-2">{uc.isActive ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2">{uc.canWithdraw ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
