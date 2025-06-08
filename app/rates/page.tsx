'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaSyncAlt, FaStar, FaRegStar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveExchangeRate from '../components/LiveExchangeRate';

// Currency metadata
const currencyMetadata = {
  'USD': { name: 'US Dollar', flag: '🇺🇸' },
  'EUR': { name: 'Euro', flag: '🇪🇺' },
  'GBP': { name: 'British Pound', flag: '🇬🇧' },
  'JPY': { name: 'Japanese Yen', flag: '🇯🇵' },
  'CAD': { name: 'Canadian Dollar', flag: '🇨🇦' },
  'AUD': { name: 'Australian Dollar', flag: '🇦🇺' },
  'CHF': { name: 'Swiss Franc', flag: '🇨🇭' },
  'CNY': { name: 'Chinese Yuan', flag: '🇨🇳' },
  'SGD': { name: 'Singapore Dollar', flag: '🇸🇬' },
  'NZD': { name: 'New Zealand Dollar', flag: '🇳🇿' },
  'INR': { name: 'Indian Rupee', flag: '🇮🇳' },
  'BRL': { name: 'Brazilian Real', flag: '🇧🇷' },
  'ZAR': { name: 'South African Rand', flag: '🇿🇦' },
  'MXN': { name: 'Mexican Peso', flag: '🇲🇽' },
  'SEK': { name: 'Swedish Krona', flag: '🇸🇪' },
  'KRW': { name: 'South Korean Won', flag: '🇰🇷' },
  'THB': { name: 'Thai Baht', flag: '🇹🇭' },
  'RUB': { name: 'Russian Ruble', flag: '🇷🇺' },
  'HKD': { name: 'Hong Kong Dollar', flag: '🇭🇰' },
  'TRY': { name: 'Turkish Lira', flag: '🇹🇷' },
};

// Interface for exchange rates data
interface ExchangeRateData {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
  success: boolean;
}

// Interface for currency with rates
interface CurrencyWithRate {
  code: string;
  name: string;
  flag: string;
  rate: number;
  change: number;
}

export default function RatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currencies, setCurrencies] = useState<CurrencyWithRate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Reference to store the interval ID for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Previous rates to calculate change
  const previousRatesRef = useRef<Record<string, number>>({});
  
  // Effect to fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      setIsRefreshing(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/currency?from=${baseCurrency}`);
        const data: ExchangeRateData = await response.json();
        
        if (data.success && data.rates) {
          // Calculate changes if we have previous rates
          const hasOldRates = Object.keys(previousRatesRef.current).length > 0;
          const newRatesWithMeta: CurrencyWithRate[] = Object.entries(data.rates).map(([code, rate]) => {
            const change = hasOldRates 
              ? rate - (previousRatesRef.current[code] || rate)
              : 0;
              
            return {
              code,
              name: currencyMetadata[code as keyof typeof currencyMetadata]?.name || code,
              flag: currencyMetadata[code as keyof typeof currencyMetadata]?.flag || '🏳️',
              rate,
              change
            };
          });
          
          // Store current rates for next change calculation
          previousRatesRef.current = data.rates;
          
          setCurrencies(newRatesWithMeta);
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          setError('Failed to fetch exchange rates');
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setError('Failed to connect to exchange rate service');
      } finally {
        setIsRefreshing(false);
      }
    };
    
    // Fetch immediately
    fetchRates();
    
    // Set up polling for real-time updates
    refreshIntervalRef.current = setInterval(fetchRates, 60000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [baseCurrency]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleFavorite = (code: string) => {
    if (favorites.includes(code)) {
      setFavorites(favorites.filter(fav => fav !== code));
    } else {
      setFavorites([...favorites, code]);
    }
  };

  const refreshRates = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/currency?from=${baseCurrency}`);
      const data: ExchangeRateData = await response.json();
      
      if (data.success && data.rates) {
        // Calculate changes if we have previous rates
        const hasOldRates = Object.keys(previousRatesRef.current).length > 0;
        const newRatesWithMeta: CurrencyWithRate[] = Object.entries(data.rates).map(([code, rate]) => {
          const change = hasOldRates 
            ? rate - (previousRatesRef.current[code] || rate)
            : 0;
            
          return {
            code,
            name: currencyMetadata[code as keyof typeof currencyMetadata]?.name || code,
            flag: currencyMetadata[code as keyof typeof currencyMetadata]?.flag || '🏳️',
            rate,
            change
          };
        });
        
        // Store current rates for next change calculation
        previousRatesRef.current = data.rates;
        
        setCurrencies(newRatesWithMeta);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError('Failed to fetch exchange rates');
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setError('Failed to connect to exchange rate service');
    } finally {
      setIsRefreshing(false);
    }
    
    // Reset the interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(refreshRates, 60000);
  };

  // Filter and sort currencies
  const filteredCurrencies = currencies.filter(currency => 
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let sortedCurrencies = [...filteredCurrencies];

  if (sortBy) {
    sortedCurrencies.sort((a, b) => {
      let valueA = a[sortBy as keyof typeof a];
      let valueB = b[sortBy as keyof typeof b];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toString().toLowerCase();
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Group by favorites
  const favoritesCurrencies = sortedCurrencies.filter(currency => favorites.includes(currency.code));
  const nonFavoritesCurrencies = sortedCurrencies.filter(currency => !favorites.includes(currency.code));
  const displayCurrencies = [...favoritesCurrencies, ...nonFavoritesCurrencies];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Live Exchange Rates
              </span>
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Get the latest exchange rates for all major world currencies. Base currency: {baseCurrency}
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full bg-gray-900/60 border border-gray-700 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Search currency..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="bg-gray-900/60 border border-gray-700 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none"
                value={baseCurrency}
                onChange={e => setBaseCurrency(e.target.value)}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <FaChevronDown className="h-4 w-4" />
              </div>
            </div>
            <button
              className={`flex items-center gap-2 bg-gray-900/60 border border-gray-700 hover:bg-gray-800 text-white py-3 px-4 rounded-lg transition-colors ${isRefreshing ? 'opacity-75' : ''}`}
              onClick={refreshRates}
              disabled={isRefreshing}
            >
              <FaSyncAlt className={`${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Rates</span>
            </button>
          </div>

          <div className="frosted rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 text-left">
                    <th className="py-4 px-6 w-10"></th>
                    <th 
                      className="py-4 px-6 cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center">
                        <span>Currency</span>
                        {sortBy === 'code' && (
                          sortOrder === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 text-right cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => handleSort('rate')}
                    >
                      <div className="flex items-center justify-end">
                        <span>Rate</span>
                        {sortBy === 'rate' && (
                          sortOrder === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 text-right cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => handleSort('change')}
                    >
                      <div className="flex items-center justify-end">
                        <span>24h Change</span>
                        {sortBy === 'change' && (
                          sortOrder === 'asc' ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {displayCurrencies.map((currency, index) => (
                    <motion.tr
                      key={currency.code}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`${
                        favorites.includes(currency.code) ? 'bg-blue-900/10' : 'hover:bg-gray-800/50'
                      } transition-colors`}
                    >
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleFavorite(currency.code)}
                          className="text-yellow-300 hover:text-yellow-500"
                        >
                          {favorites.includes(currency.code) ? <FaStar /> : <FaRegStar />}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="mr-3 text-xl">{currency.flag}</span>
                          <div>
                            <div className="font-medium">{currency.code}</div>
                            <div className="text-sm text-gray-400">{currency.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-mono">
                        {currency.rate.toFixed(4)}
                      </td>
                      <td className={`py-4 px-6 text-right font-mono ${
                        currency.change > 0 ? 'text-green-500' : currency.change < 0 ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {currency.change > 0 ? '+' : ''}{currency.change.toFixed(4)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>          <div className="mt-8 text-center text-gray-400">
            <p>Rates are updated every minute. Last updated: {lastUpdated}</p>
            <p className="text-sm mt-2">
              <span className="text-yellow-300">★</span> Star currencies to add them to your favorites
            </p>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-900/40 border border-red-700 rounded-lg text-red-200">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Quick Rate Chart
              </span>
            </h2>
            
            <div className="frosted p-6 rounded-xl">
              <LiveExchangeRate 
                baseCurrency={baseCurrency}
                refreshInterval={30000}
                displayCurrencies={['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'NZD']}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
