"use client";

import { useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';

export default function Page() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch currencies from API
  const fetchCurrencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/currency");
      const data = await res.json();
      if (data.success) {
        setCurrencies(data.currencies);
      } else {
        setError(data.error || "Failed to fetch currencies");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch currencies");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useRealtimeUpdates((event) => {
    if (event.type === 'currency') {
      if (Array.isArray(event.payload)) {
        setCurrencies(event.payload);
        setLoading(false);
      } else {
        fetchCurrencies();
      }
    }
  });

  // Add new currency
  const handleAddCurrency = async () => {
    const from = prompt("From currency code (e.g. USD)?");
    const to = prompt("To currency code (e.g. EUR)?");
    const name = prompt("Pair name (e.g. US Dollar to Euro)?");
    if (from && to && name) {
      setIsSyncing(true);
      await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", from, to, name }),
      });
      fetchCurrencies();
      setIsSyncing(false);
    }
  };

  // Delete currency
  const handleDeleteCurrency = async (id: any) => {
    if (confirm("Delete this currency pair?")) {
      setIsSyncing(true);
      await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      fetchCurrencies();
      setIsSyncing(false);
    }
  };

  // Edit currency
  const handleEditCurrency = async (currency: any) => {
    const from = prompt("From currency code?", currency.from);
    const to = prompt("To currency code?", currency.to);
    const name = prompt("Pair name?", currency.name);
    if (from && to && name) {
      setIsSyncing(true);
      await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", id: currency.id, from, to, name }),
      });
      fetchCurrencies();
      setIsSyncing(false);
    }
  };

  // Reorder currencies
  const handleMove = async (id: any, direction: "up" | "down") => {
    setIsSyncing(true);
    await fetch("/api/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", id, direction }),
    });
    fetchCurrencies();
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-5xl mx-auto pt-24 pb-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Currencies</h1>
          <div className="flex gap-2">
            <a href="/admin/currencies" className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition">Currencies</a>
            <a href="/admin/counters" className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition">Counters</a>
            <button
              onClick={fetchCurrencies}
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
            onClick={handleAddCurrency}
            disabled={isSyncing}
          >Add Currency Pair</button>
          {loading ? (
            <div className="text-gray-400">Loading currencies...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-400">
                <thead>
                  <tr>
                    <th className="px-4 py-2">From</th>
                    <th className="px-4 py-2">To</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Order</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((c, i) => (
                    <tr key={c.id} className="bg-gray-800/40">
                      <td className="px-4 py-2">{c.from}</td>
                      <td className="px-4 py-2">{c.to}</td>
                      <td className="px-4 py-2">{c.name}</td>
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 flex gap-1">
                        <button className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={() => handleMove(c.id, "up")}>↑</button>
                        <button className="px-2 py-1 bg-blue-700 text-white rounded hover:bg-blue-800" onClick={() => handleMove(c.id, "down")}>↓</button>
                        <button className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800" onClick={() => handleEditCurrency(c)}>Edit</button>
                        <button className="px-2 py-1 bg-red-700 text-white rounded hover:bg-red-800" onClick={() => handleDeleteCurrency(c.id)}>Delete</button>
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
