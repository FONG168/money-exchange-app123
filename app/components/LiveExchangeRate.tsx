'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaChartLine } from 'react-icons/fa';

interface ExchangeRateData {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
  success: boolean;
}

interface LiveExchangeRateProps {
  baseCurrency?: string;
  displayCurrencies?: string[];
  refreshInterval?: number;  // in milliseconds
}

const defaultCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'NZD'];

const LiveExchangeRate = ({
  baseCurrency = 'USD',
  displayCurrencies = defaultCurrencies,
  refreshInterval = 60000  // Default to 1 minute
}: LiveExchangeRateProps) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Reference to store the interval ID for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch exchange rates
  const fetchExchangeRates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/currency?from=${baseCurrency}`);
      const data: ExchangeRateData = await response.json();
      
      if (data.success && data.rates) {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setError('Failed to connect to exchange rate service');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch rates and set up polling
  useEffect(() => {
    // Fetch rates immediately
    fetchExchangeRates();
    
    // Set up real-time updates at specified interval
    refreshIntervalRef.current = setInterval(fetchExchangeRates, refreshInterval);
    
    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [baseCurrency, refreshInterval]);

  // Manual refresh function
  const handleRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    fetchExchangeRates();
    
    // Reset the interval
    refreshIntervalRef.current = setInterval(fetchExchangeRates, refreshInterval);
  };

  // Filter currencies to display
  const filteredRates = Object.entries(rates).filter(
    ([code]) => displayCurrencies.includes(code) && code !== baseCurrency
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Live Exchange Rates
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400 flex items-center">
            <FaChartLine className="mr-1" />
            <span>Base: {baseCurrency}</span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            aria-label="Refresh rates"
          >
            <FaSync className={`text-white h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {isLoading && filteredRates.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-gray-800/40 rounded-lg p-3 animate-pulse">
              <div className="h-5 bg-gray-700 rounded mb-2 w-16"></div>
              <div className="h-6 bg-gray-700 rounded w-24"></div>
            </div>
          ))
        ) : (
          // Actual rates
          filteredRates.map(([code, rate]) => (
            <div key={code} className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-800/60 transition-colors">
              <p className="text-gray-400 text-sm mb-1">{code}</p>
              <p className="text-white font-medium text-lg">{rate.toFixed(4)}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 flex justify-end items-center">
        <FaSync className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Updating...' : `Last updated: ${lastUpdated}`}</span>
      </div>
    </div>
  );
};

export default LiveExchangeRate;