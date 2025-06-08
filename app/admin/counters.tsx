"use client";

import { FaSync } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

export default function Page() {
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch counters from API
  const fetchCounters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin?type=counters");
      const data = await res.json();
      if (data.success) {
        setCounters(data.counters);
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
      // TODO: setCounters(event.payload) if you have local state
      // For now, just reload or refetch as needed
      fetchCounters();
    }
  });

  // Add new counter
  const handleAddCounter = async () => {
    const name = prompt("Counter name?");
    const minDeposit = prompt("Min deposit?");
    const dailyOrders = prompt("Daily orders?");
    const commission = prompt("Commission (%)?");
    const description = prompt("Description?");
    const exchangeAmountMin = prompt("Min exchange amount?");
    const exchangeAmountMax = prompt("Max exchange amount?");
    if (name && minDeposit && dailyOrders && commission && description && exchangeAmountMin && exchangeAmountMax) {
      setIsSyncing(true);
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addCounter",
          name,
          minDeposit: Number(minDeposit),
          dailyOrders: Number(dailyOrders),
          commission: Number(commission),
          description,
          exchangeAmountMin: Number(exchangeAmountMin),
          exchangeAmountMax: Number(exchangeAmountMax),
        }),
      });
      fetchCounters();
      setIsSyncing(false);
    }
  };

  // Delete counter
  const handleDeleteCounter = async (id: any) => {
    if (confirm("Delete this counter level?")) {
      setIsSyncing(true);
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteCounter", id }),
      });
      fetchCounters();
      setIsSyncing(false);
    }
  };

  // Edit counter
  const handleEditCounter = async (counter: any) => {
    const name = prompt("Counter name?", counter.name);
    const minDeposit = prompt("Min deposit?", counter.minDeposit);
    const dailyOrders = prompt("Daily orders?", counter.dailyOrders);
    const commission = prompt("Commission (%)?", counter.commission);
    const description = prompt("Description?", counter.description);
    const exchangeAmountMin = prompt("Min exchange amount?", counter.exchangeAmountMin);
    const exchangeAmountMax = prompt("Max exchange amount?", counter.exchangeAmountMax);
    if (name && minDeposit && dailyOrders && commission && description && exchangeAmountMin && exchangeAmountMax) {
      setIsSyncing(true);
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "editCounter",
          id: counter.id,
          name,
          minDeposit: Number(minDeposit),
          dailyOrders: Number(dailyOrders),
          commission: Number(commission),
          description,
          exchangeAmountMin: Number(exchangeAmountMin),
          exchangeAmountMax: Number(exchangeAmountMax),
        }),
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
            onClick={handleAddCounter}
            disabled={isSyncing}
          >Add Counter Level</button>
          {loading ? (
            <div className="text-gray-400">Loading counters...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="overflow-x-auto">
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
                        <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800" onClick={() => handleEditCounter(c)}>Edit</button>
                        <button className="px-2 py-1 bg-red-700 text-white rounded hover:bg-red-800" onClick={() => handleDeleteCounter(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
