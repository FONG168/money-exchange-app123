'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaExchangeAlt, 
  FaCheck, 
  FaClock, 
  FaDollarSign,
  FaChartLine,
  FaTimes,
  FaPlay,
  FaArrowRight,
  FaHome,
  FaGlobe,
  FaFire,
  FaBolt,
  FaUsers,
  FaArrowUp,
  FaWallet,
  FaRandom
} from 'react-icons/fa';
import { useMoneyExchange, COUNTERS, generateRandomOrder } from '../contexts/MoneyExchangeContext';
import MobileNav from '../components/MobileNav';
import CounterSummary from '../components/CounterSummary';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

// Currency formatting utility function
const formatCurrency = (amount: number, currency?: string): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return currency ? `${formatted} ${currency}` : `$${formatted}`;
};

const formatAmount = (amount: number): string => {
  // For large amounts, show in K/M format for better readability
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 10000) {
    return `${(amount / 1000).toFixed(0)}K`;
  } else {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

// Enhanced amount formatting for potentially large output amounts
const formatOutputAmount = (amount: number): string => {
  if (amount >= 1000000) {
    // For very large amounts (like VND), show as M or K
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    }
  } else if (amount >= 10000) {
    // For large amounts, show with commas but no decimals if whole number
    if (amount % 1 === 0) {
      return new Intl.NumberFormat('en-US').format(amount);
    }
  }
  
  // Default formatting with 2 decimal places
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Enhanced exchange rate formatting that handles very small and large numbers
const formatExchangeRate = (rate: number): string => {
  if (rate >= 1000) {
    // For large rates (like VND), show with comma separators
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate);
  } else if (rate >= 1) {
    // For normal rates, show 4 decimal places
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(rate);
  } else if (rate >= 0.0001) {
    // For small rates, show 6 decimal places
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(rate);
  } else {
    // For very small rates, use scientific notation
    return rate.toExponential(6);
  }
};

// Mapping of currencies to country, cities, and typical names
const currencyMeta: Record<string, { country: string; cities: string[]; names: string[] }> = {
  USD: {
    country: 'United States',
    cities: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami', 'Houston', 'Seattle'],
    names: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
  },
  EUR: {
    country: 'Europe',
    cities: ['Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Brussels'],
    names: ['Luca', 'Marie', 'Sophie', 'Leon', 'Anna', 'Paul', 'Laura', 'Luis', 'Julia', 'Max', 'Emma', 'Lucas', 'Mia', 'Noah', 'Lea', 'Elias', 'Lina', 'Ben', 'Clara', 'Finn']
  },
  GBP: {
    country: 'United Kingdom',
    cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh', 'Glasgow'],
    names: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar', 'Amelia', 'Olivia', 'Isla', 'Emily', 'Ava', 'Ella', 'Jessica', 'Lily', 'Sophia', 'Mia']
  },
  JPY: {
    country: 'Japan',
    cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo'],
    names: ['Haruto', 'Yuto', 'Sota', 'Yuki', 'Hayato', 'Sora', 'Hinata', 'Kaito', 'Yuma', 'Riku', 'Yui', 'Aoi', 'Rio', 'Mei', 'Hina', 'Yuna', 'Saki', 'Rin', 'Mio', 'Miyu']
  },
  CNY: {
    country: 'China',
    cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou'],
    names: ['Wei', 'Fang', 'Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo', 'He', 'Gao']
  },
  KRW: {
    country: 'South Korea',
    cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'],
    names: ['Minjun', 'Seo-yeon', 'Ji-hoon', 'Ha-yeon', 'Jiwoo', 'Jimin', 'Soo-bin', 'Jisoo', 'Hyun-woo', 'Yuna', 'Seojun', 'Hana', 'Jiwon', 'Jiwon', 'Jiwon', 'Jiwon', 'Jiwon', 'Jiwon', 'Jiwon', 'Jiwon']
  },
  VND: {
    country: 'Vietnam',
    cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho'],
    names: ['Nguyen', 'Tran', 'Le', 'Pham', 'Huynh', 'Hoang', 'Phan', 'Vu', 'Dang', 'Bui', 'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Son', 'Trinh', 'Quang', 'Minh', 'Anh']
  },
  THB: {
    country: 'Thailand',
    cities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Khon Kaen'],
    names: ['Somchai', 'Somsak', 'Somyot', 'Somboon', 'Somporn', 'Somjit', 'Somnuk', 'Sommai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai', 'Somchai']
  },
  SGD: {
    country: 'Singapore',
    cities: ['Singapore'],
    names: ['Wei', 'Jia', 'Min', 'Li', 'Hui', 'Fang', 'Yong', 'Hao', 'Xin', 'Ting', 'Jun', 'Qi', 'Zhi', 'Ying', 'Ming', 'Shan', 'Jing', 'Hui', 'Yun', 'Xiang']
  },
  MYR: {
    country: 'Malaysia',
    cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Kuching'],
    names: ['Ahmad', 'Muhammad', 'Nur', 'Aisyah', 'Siti', 'Fatimah', 'Aminah', 'Abu', 'Ali', 'Hassan', 'Husna', 'Aziz', 'Rahman', 'Latif', 'Salleh', 'Yusof', 'Zainab', 'Zainal', 'Rosli', 'Shamsul']
  },
  INR: {
    country: 'India',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
    names: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Aadhya', 'Diya', 'Pari', 'Anika', 'Myra', 'Sara', 'Ira', 'Prisha', 'Riya']
  },
  AUD: {
    country: 'Australia',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    names: ['Oliver', 'William', 'Jack', 'Noah', 'Thomas', 'James', 'Lucas', 'Henry', 'Leo', 'Charlie', 'Amelia', 'Olivia', 'Isla', 'Emily', 'Ava', 'Mia', 'Grace', 'Ella', 'Sophie', 'Chloe']
  }
};

// Helper to generate random exchanger/receiver/location/transactionId with contextual info
function generateRandomExchangeMeta(fromCurrency: string, toCurrency: string) {
  const fromMeta = currencyMeta[fromCurrency] || currencyMeta['USD'];
  const toMeta = currencyMeta[toCurrency] || currencyMeta['USD'];
  // Changer: name from 'from' country, location in 'to' country
  const changer = fromMeta.names[Math.floor(Math.random() * fromMeta.names.length)];
  const changerLocation = `${toMeta.cities[Math.floor(Math.random() * toMeta.cities.length)]}, ${toMeta.country}`;
  // Receiver: name from 'to' country, location in 'to' country
  let receiver = toMeta.names[Math.floor(Math.random() * toMeta.names.length)];
  let tries = 0;
  while (receiver === changer && tries < 5) {
    receiver = toMeta.names[Math.floor(Math.random() * toMeta.names.length)];
    tries++;
  }
  const receiverLocation = `${toMeta.cities[Math.floor(Math.random() * toMeta.cities.length)]}, ${toMeta.country}`;
  const transactionId = `TX${Date.now().toString().slice(-6)}${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
  return { changer, changerLocation, receiver, receiverLocation, transactionId };
}

// Mock data for global transactions
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'VND', 'THB', 'SGD', 'MYR', 'INR', 'AUD'];
const countries = ['🇺🇸', '🇪🇺', '🇬🇧', '🇯🇵', '🇨🇳', '🇰🇷', '🇻🇳', '🇹🇭', '🇸🇬', '🇲🇾', '🇮🇳', '🇦🇺'];

// Generate mock global transaction with realistic international amounts
const generateGlobalTransaction = () => {
  const fromCurrency = currencies[Math.floor(Math.random() * currencies.length)];
  let toCurrency = currencies[Math.floor(Math.random() * currencies.length)];
  while (toCurrency === fromCurrency) {
    toCurrency = currencies[Math.floor(Math.random() * currencies.length)];
  }

  // Generate random names for changer and receiver
  const names = [
    'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Helen', 'Ivan', 'Julia',
    'Kevin', 'Lily', 'Mike', 'Nina', 'Oscar', 'Paula', 'Quinn', 'Rita', 'Sam', 'Tina',
    'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zane'
  ];
  const changer = names[Math.floor(Math.random() * names.length)];
  let receiver = names[Math.floor(Math.random() * names.length)];
  while (receiver === changer) {
    receiver = names[Math.floor(Math.random() * names.length)];
  }

  // Generate random location (city/country)
  const locations = [
    'New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 'Berlin, Germany',
    'Sydney, Australia', 'Toronto, Canada', 'Singapore', 'Hong Kong', 'Bangkok, Thailand',
    'Seoul, South Korea', 'Hanoi, Vietnam', 'Kuala Lumpur, Malaysia', 'Mumbai, India',
    'Shanghai, China', 'Los Angeles, USA', 'Dubai, UAE', 'Zurich, Switzerland', 'Madrid, Spain', 'Rome, Italy'
  ];
  const exchangerLocation = locations[Math.floor(Math.random() * locations.length)];

  // Generate realistic international transaction amounts (thousands to hundreds of thousands)
  const baseAmount = Math.random() < 0.7 
    ? Math.floor(Math.random() * 50000) + 5000    // 5K - 55K (most common)
    : Math.random() < 0.9 
    ? Math.floor(Math.random() * 200000) + 50000  // 50K - 250K (business transactions)
    : Math.floor(Math.random() * 500000) + 250000; // 250K - 750K (large corporate)

  const rate = Math.random() * 100 + 0.5;
  const country = countries[currencies.indexOf(fromCurrency)];
  const transactionId = `TX${Date.now().toString().slice(-6)}${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
  return {
    id: Date.now() + Math.random(),
    from: fromCurrency,
    to: toCurrency,
    amount: baseAmount,
    rate,
    country,
    changer,
    receiver,
    exchangerLocation,
    transactionId,
    timestamp: new Date(),
    status: 'completed' // Only generate completed transactions
  };
};

// Helper to generate random exchanger/receiver/location/transactionId
function generateRandomExchangeMetaHelper() {
  const names = [
    'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Helen', 'Ivan', 'Julia',
    'Kevin', 'Lily', 'Mike', 'Nina', 'Oscar', 'Paula', 'Quinn', 'Rita', 'Sam', 'Tina',
    'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zane'
  ];
  const locations = [
    'New York, USA', 'London, UK', 'Tokyo, Japan', 'Paris, France', 'Berlin, Germany',
    'Sydney, Australia', 'Toronto, Canada', 'Singapore', 'Hong Kong', 'Bangkok, Thailand',
    'Seoul, South Korea', 'Hanoi, Vietnam', 'Kuala Lumpur, Malaysia', 'Mumbai, India',
    'Shanghai, China', 'Los Angeles, USA', 'Dubai, UAE', 'Zurich, Switzerland', 'Madrid, Spain', 'Rome, Italy'
  ];
  const changer = names[Math.floor(Math.random() * names.length)];
  let receiver = names[Math.floor(Math.random() * names.length)];
  while (receiver === changer) {
    receiver = names[Math.floor(Math.random() * names.length)];
  }
  const exchangerLocation = locations[Math.floor(Math.random() * locations.length)];
  const transactionId = `TX${Date.now().toString().slice(-6)}${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
  return { changer, receiver, exchangerLocation, transactionId };
}

// Professional order component
const ProfessionalOrder = ({ order, onSelect }: { order: any, onSelect: () => void }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  useEffect(() => {
    // Subtle highlight every 8-12 seconds
    const highlightInterval = setInterval(() => {
      setIsHighlighted(true);
      setTimeout(() => setIsHighlighted(false), 2000);
    }, 8000 + Math.random() * 4000);
    
    return () => clearInterval(highlightInterval);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={`relative p-5 rounded-lg cursor-pointer transition-all duration-300 border ${
        isHighlighted 
          ? 'bg-blue-50/5 border-blue-400/30 shadow-lg shadow-blue-500/10' 
          : 'bg-white/5 border-gray-700/50 hover:border-gray-600/70 hover:bg-white/10'
      } backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-slate-200">{order.pair.from}</span>
            <div className="w-6 h-px bg-gradient-to-r from-gray-500 to-transparent"></div>
            <span className="text-lg font-semibold text-slate-200">{order.pair.to}</span>
          </div>
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <span className="text-xs text-emerald-400 font-medium">AVAILABLE</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Fee</p>
          <p className="text-base font-semibold text-emerald-400">
            ${(order.amount * 0.02).toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Amount</p>
          <p className="text-white font-semibold">${formatAmount(order.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Rate</p>
          <p className="text-white font-semibold">{formatExchangeRate(order.rate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Output</p>
          <p className="text-white font-semibold">
            {formatOutputAmount(order.amount * order.rate)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/30">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <FaClock className="w-3 h-3" />
          <span>Valid for 30 seconds</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-blue-400">
          <FaExchangeAlt className="w-3 h-3" />
          <span>Instant Exchange</span>
        </div>
      </div>
    </motion.div>
  );
};

// Professional transactions feed component
const ProfessionalTransactionsFeed = () => {
  const [pool, setPool] = useState<any[]>([]); // Large pool of transactions
  const [displayed, setDisplayed] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ total: 0, volume: 0 });
  const maxDisplay = 10; // Number of visible transactions
  const poolSize = 200; // Size of the transaction pool
  const updateInterval = 350; // ms between new transaction

  // Generate a large pool of transactions on mount
  useEffect(() => {
    const initialPool = Array.from({ length: poolSize }, generateGlobalTransaction);
    setPool(initialPool);
    setDisplayed(initialPool.slice(0, maxDisplay));
    const initialVolume = initialPool.reduce((sum, tx) => sum + tx.amount, 0);
    setLiveStats({ total: 8247, volume: initialVolume + 125000000 });
  }, []);

  // Slide in one new transaction at a time, like a ticker
  useEffect(() => {
    if (pool.length === 0) return;
    let poolIdx = maxDisplay;
    const interval = setInterval(() => {
      // Cycle through the pool
      const nextTx = pool[poolIdx % pool.length];
      setDisplayed(prev => [
        { ...nextTx, _rand: Math.random() },
        ...prev.slice(0, maxDisplay - 1)
      ]);
      setLiveStats(prev => ({
        total: prev.total + 1,
        volume: prev.volume + nextTx.amount
      }));
      poolIdx++;
    }, updateInterval);
    return () => clearInterval(interval);
  }, [pool]);

  // --- Floating Animation Hook ---
  function useFloatingAnimation(count: number) {
    // Returns an array of animation states for each item
    const [styles, setStyles] = useState(() =>
      Array.from({ length: count }, (_, idx) => ({
        x: 0,
        y: 0,
        scale: 1,
        boxShadow: '0 2px 8px 0 rgba(16,185,129,0.08)'
      }))
    );

    useEffect(() => {
      let raf: number;
      function animate() {
        setStyles(prev =>
          prev.map((_, idx) => {
            const t = Date.now() / 1000 + idx * 0.7;
            return {
              x: Math.sin(t + idx) * 8,
              y: Math.cos(t * 0.8 + idx) * 6,
              scale: 1 + Math.sin(t * 0.7 + idx) * 0.04,
              boxShadow: `0 2px 8px 0 rgba(16,185,129,${0.08 + 0.04 * Math.abs(Math.sin(t + idx))})`
            };
          })
        );
        raf = requestAnimationFrame(animate);
      }
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, [count]);

    return styles;
  }

  // Move hook call outside of map
  const floats = useFloatingAnimation(displayed.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      {/* Removed Live Completed Transactions header and stats */}
      {/* Floating Animation Feed */}
      <div className="relative max-h-96 overflow-hidden" style={{ height: 56 * maxDisplay }}>
        <div className="flex flex-col">
          {displayed.map((tx, idx) => (
            <motion.div
              key={tx.id ? tx.id : `${tx.from}-${tx.to}-${tx.amount}-${tx.timestamp?.toString?.() || idx}`}
              initial={idx === 0 ? { y: -60, opacity: 0 } : { y: 0, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                minHeight: 72,
                height: 72,
                ...floats[idx],
              }}
              className="flex flex-col justify-between p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 backdrop-blur-sm mb-2 shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-base">{tx.country}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-300">{tx.from}</span>
                    <FaArrowRight className="text-xs text-gray-500" />
                    <span className="text-sm font-medium text-gray-300">{tx.to}</span>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Completed
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">${formatAmount(tx.amount)}</p>
                  <p className="text-xs text-gray-500">{tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between mt-1 text-xs text-gray-400 gap-x-4 gap-y-1">
                <span>Changer: <span className="text-white font-medium">{tx.changer}</span></span>
                <span>Receiver: <span className="text-white font-medium">{tx.receiver}</span></span>
                <span>Location: <span className="text-white font-medium">{tx.exchangerLocation}</span></span>
                <span>ID: <span className="text-blue-300 font-mono">{tx.transactionId}</span></span>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Fade overlay for effect */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

// Market statistics component
function MarketStatsProfessional() {
  const [stats, setStats] = useState({
    totalVolume: 1250000000,
    activeTraders: 8247,
    completedToday: 23841,
    averageRate: 1.23
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 2500000) + 500000,
        activeTraders: Math.max(5000, prev.activeTraders + Math.floor(Math.random() * 200) - 100),
        completedToday: prev.completedToday + Math.floor(Math.random() * 15) + 5,
        averageRate: prev.averageRate + (Math.random() - 0.5) * 0.02
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-8 bg-gradient-to-r from-blue-950/60 to-slate-900/60">
      <div className="flex flex-col items-center justify-center">
        <FaDollarSign className="text-lg text-blue-400 mb-2" />
        <span className="text-xs text-gray-400 mb-1">Volume 24h</span>
        <span className="text-xl font-semibold text-white tracking-tight">{stats.totalVolume >= 1000000000 ? `${(stats.totalVolume / 1000000000).toFixed(1)}B` : `${(stats.totalVolume / 1000000).toFixed(0)}M`}</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <FaUsers className="text-lg text-green-400 mb-2" />
        <span className="text-xs text-gray-400 mb-1">Active Traders</span>
        <span className="text-xl font-semibold text-green-300 tracking-tight">{stats.activeTraders.toLocaleString()}</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <FaArrowUp className="text-lg text-purple-400 mb-2" />
        <span className="text-xs text-gray-400 mb-1">Completed Today</span>
        <span className="text-xl font-semibold text-purple-300 tracking-tight">{stats.completedToday.toLocaleString()}</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <FaChartLine className="text-lg text-yellow-400 mb-2" />
        <span className="text-xs text-gray-400 mb-1">Avg Rate</span>
        <span className="text-xl font-semibold text-yellow-300 tracking-tight">{stats.averageRate.toFixed(4)}</span>
      </div>
    </div>
  );
}

export default function ExchangePage() {
  const router = useRouter();
  const { state, dispatch } = useMoneyExchange();

  // Ban/freeze enforcement
  if (state.user.banned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Account Banned</h1>
        <p className="mb-4">Your account has been banned by the administrator. You no longer have access to the exchange page.</p>
        <button className="px-4 py-2 bg-red-600 rounded" onClick={() => window.location.href = '/auth'}>Return to Login</button>
      </div>
    );
  }
  const isFrozen = state.user.frozen;

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPreparingNewOrder, setIsPreparingNewOrder] = useState(false);
  const [showNewOrderNotification, setShowNewOrderNotification] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lotteryOrders, setLotteryOrders] = useState<any[]>([]);
  const [showLotteryModal, setShowLotteryModal] = useState(false);

  const currentExchange = state.currentExchange;

  useEffect(() => {
    if (!currentExchange) {
      router.push('/dashboard');
      return;
    }

    // Generate lottery orders
    const generateLotteryOrders = () => {
      const orders = Array.from({ length: 3 }, () => generateRandomOrder(currentExchange.counterId));
      setLotteryOrders(orders);
    };

    generateLotteryOrders();
      // Regenerate lottery orders every 6 seconds for faster updates
    const lotteryInterval = setInterval(generateLotteryOrders, 6000);

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired, generate new order
          const newOrder = generateRandomOrder(currentExchange.counterId);
          dispatch({
            type: 'SET_CURRENT_EXCHANGE',
            payload: {
              counterId: currentExchange.counterId,
              pair: newOrder.pair,
              amount: newOrder.amount,
              rate: newOrder.rate,
              ...generateRandomExchangeMeta(newOrder.pair.from, newOrder.pair.to),
            },
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(lotteryInterval);
    };
  }, [currentExchange, dispatch, router]);

  const handleCompleteExchange = async () => {
    if (!currentExchange) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate exchange processing with progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    const counter = COUNTERS[currentExchange.counterId];
    const commission = currentExchange.amount * (counter.commission / 100);

    dispatch({
      type: 'COMPLETE_EXCHANGE',
      payload: {
        counterId: currentExchange.counterId,
        pair: currentExchange.pair,
        amount: currentExchange.amount,
        rate: currentExchange.rate,
        commission,
      },
    });    setIsProcessing(false);
    setShowSuccess(true);

    // Generate new order and stay on exchange page
    setTimeout(() => {
      setIsPreparingNewOrder(true);
    }, 2000);    setTimeout(() => {
      const newOrder = generateRandomOrder(currentExchange.counterId);
      dispatch({
        type: 'SET_CURRENT_EXCHANGE',
        payload: {
          counterId: currentExchange.counterId,
          pair: newOrder.pair,
          amount: newOrder.amount,
          rate: newOrder.rate,
          ...generateRandomExchangeMeta(newOrder.pair.from, newOrder.pair.to),
        },
      });
      setShowSuccess(false);
      setIsPreparingNewOrder(false);
      setTimeLeft(30);
      setProgress(0);
      
      // Show new order notification
      setShowNewOrderNotification(true);
      setTimeout(() => setShowNewOrderNotification(false), 3000);
    }, 3000);
  };

  const handleCancelExchange = () => {
    dispatch({ type: 'CLEAR_CURRENT_EXCHANGE' });
    router.back();
  };  const handleNewOrder = () => {
    if (!currentExchange) return;
    
    setShowLotteryModal(true);
  };

  const handleSelectLotteryOrder = (selectedOrder: any) => {
    if (!currentExchange) return;
    
    dispatch({
      type: 'SET_CURRENT_EXCHANGE',
      payload: {
        counterId: currentExchange.counterId,
        pair: selectedOrder.pair,
        amount: selectedOrder.amount,
        rate: selectedOrder.rate,
        ...generateRandomExchangeMeta(selectedOrder.pair.from, selectedOrder.pair.to),
      },
    });

    setTimeLeft(30);
    setShowSuccess(false);
    setIsPreparingNewOrder(false);
    setShowNewOrderNotification(false);
    setProgress(0);
    setShowLotteryModal(false);
    
    // Show selection notification
    setShowNewOrderNotification(true);
    setTimeout(() => setShowNewOrderNotification(false), 3000);
  };

  // Realtime updates
  useRealtimeUpdates((event) => {
    if (event.type === 'user' || event.type === 'currency' || event.type === 'counter') {
      window.location.reload();
    }
  });

  if (!currentExchange) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Active Exchange</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    const counter = COUNTERS[currentExchange.counterId];
    const commission = currentExchange.amount * (counter.commission / 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="frosted p-8 rounded-2xl text-center max-w-md mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheck className="text-3xl text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">Exchange Completed!</h2>          <div className="space-y-2 mb-6">
            <p className="text-gray-400">
              Successfully exchanged {formatAmount(currentExchange.amount)} {currentExchange.pair.from} to{' '}
              {formatAmount(currentExchange.amount * currentExchange.rate)} {currentExchange.pair.to}
            </p>
            <p className="text-green-400 font-bold">
              Commission Earned: {formatCurrency(commission)}
            </p>
          </div><p className="text-sm text-blue-400">
            {isPreparingNewOrder ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span>Preparing new exchange order...</span>
              </div>
            ) : (
              'Order completed successfully!'
            )}
          </p>
        </motion.div>
      </div>
    );
  }

  const counter = COUNTERS[currentExchange.counterId];
  const counterData = state.counters[currentExchange.counterId];
  const outputAmount = currentExchange.amount * currentExchange.rate;
  const commission = currentExchange.amount * (counter.commission / 100);

  // Patch the type for currentExchange to allow extra meta fields
  // (TypeScript only, but for JS, just use as any)

  // When reading currentExchange, cast as any to avoid TS errors
  // Example:
  // const meta = currentExchange as any;
  const meta = currentExchange as any;

  return (    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleCancelExchange}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-white text-sm sm:text-base" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Go to Homepage"
            >
              <FaHome className="text-white text-sm sm:text-base" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                <span className="hidden sm:inline">Currency Exchange</span>
                <span className="sm:hidden">Exchange</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base truncate">{counter.name} - {currentExchange.pair.name}</p>
            </div>
          </div>          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-400">Total Tasks</p>
              <p className="text-sm sm:text-lg font-bold text-purple-400">
                {state.counters[currentExchange.counterId].completedTasks}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-400">Daily Progress</p>
              <p className="text-sm sm:text-lg font-bold text-cyan-400">
                {state.counters[currentExchange.counterId].dailyCompletedOrders} / {counter.dailyOrders}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-orange-400">
              <FaClock className="text-sm sm:text-base" />
              <span className="font-mono font-bold text-sm sm:text-lg">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Counter Summary Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <CounterSummary
          balance={counterData.balance}
          totalEarnings={counterData.totalEarnings}
          dailyCompletedOrders={counterData.dailyCompletedOrders}
          dailyOrders={counter.dailyOrders}
          commission={counter.commission}
          canWithdraw={counterData.canWithdraw}
        />
      </div>
      {/* ...existing code... */}
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-8">
        {/* Lottery Modal */}
        <AnimatePresence>
          {showLotteryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLotteryModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="frosted p-6 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FaRandom className="text-2xl text-purple-400" />
                    <h2 className="text-2xl font-bold text-white">Choose Your Lucky Order</h2>
                  </div>
                  <button
                    onClick={() => setShowLotteryModal(false)}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {lotteryOrders.map((order, index) => (
                    <ProfessionalOrder
                      key={`${order.pair.from}-${order.pair.to}-${order.amount}-${index}`}
                      order={order}
                      onSelect={() => handleSelectLotteryOrder(order)}
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Choose wisely! Each order has different profit potential. 
                    <span className="text-yellow-400 ml-1">🔥 Hot orders expire faster!</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* New Order Notification */}
        <AnimatePresence>
          {showNewOrderNotification && (            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="frosted p-3 sm:p-4 rounded-xl border-l-4 border-blue-500 bg-blue-500/10"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <FaArrowRight className="text-blue-400 text-xs sm:text-sm" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm sm:text-base">New Exchange Order Generated</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">Ready for your next currency exchange</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exchange Overview */}        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="frosted p-4 sm:p-6 rounded-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">Exchange Details</h2>          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">            {/* From Currency */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center border-2 border-blue-500/30">
                <span className="text-lg sm:text-2xl font-bold text-blue-400">
                  {currentExchange.pair.from}
                </span>
              </div>              <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">You Send</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {formatAmount(currentExchange.amount)}
              </p>
              <p className="text-blue-400 font-medium text-sm sm:text-base">
                {currentExchange.pair.from}
              </p>
            </div>            {/* Exchange Arrow */}
            <div className="flex flex-col items-center justify-center order-last sm:order-none">
              <motion.div
                animate={{ 
                  rotate: isProcessing ? 360 : 0,
                  scale: isProcessing ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: isProcessing ? 1 : 0, repeat: isProcessing ? Infinity : 0 },
                  scale: { duration: 0.5, repeat: isProcessing ? Infinity : 0 }
                }}
                className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border-2 border-purple-500/30 mb-2 sm:mb-4"
              >
                <FaExchangeAlt className="text-lg sm:text-xl text-purple-400" />
                
                {/* Floating particles effect */}
                {isProcessing && (
                  <>
                    <motion.div
                      className="absolute w-1 h-1 bg-blue-400 rounded-full"
                      animate={{
                        x: [0, 20, -20, 0],
                        y: [0, -20, 20, 0],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute w-1 h-1 bg-purple-400 rounded-full"
                      animate={{
                        x: [0, -15, 15, 0],
                        y: [0, 15, -15, 0],
                        opacity: [1, 0.3, 1]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </>
                )}
              </motion.div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Exchange Rate</p>              <motion.p 
                className="text-sm sm:text-lg font-bold text-green-400"
                animate={isProcessing ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
              >
                {formatExchangeRate(currentExchange.rate)}
              </motion.p>
            </div>

            {/* To Currency */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center border-2 border-green-500/30">
                <span className="text-lg sm:text-2xl font-bold text-green-400">
                  {currentExchange.pair.to}
                </span>
              </div>              <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">You Receive</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {formatOutputAmount(outputAmount)}
              </p>
              <p className="text-green-400 font-medium text-sm sm:text-base">
                {currentExchange.pair.to}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Processing Progress */}
        {isProcessing && (          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="frosted p-4 sm:p-6 rounded-xl"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Processing Exchange...</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 sm:h-3 rounded-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className={`p-2 sm:p-3 rounded-lg ${progress > 30 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                  <FaCheck className="mx-auto mb-1 sm:mb-2 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm">Verifying</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${progress > 60 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                  <FaExchangeAlt className="mx-auto mb-1 sm:mb-2 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm">Processing</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${progress >= 100 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                  <FaDollarSign className="mx-auto mb-1 sm:mb-2 text-sm sm:text-base" />
                  <p className="text-xs sm:text-sm">Completing</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Commission & Summary */}        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="frosted p-4 sm:p-6 rounded-xl"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Transaction Summary</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Exchange Pair:</span>
                <span className="text-white font-mono text-sm sm:text-base">
                  {currentExchange.pair.from}/{currentExchange.pair.to}
                </span>
              </div>              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Input Amount:</span>
                <span className="text-blue-400 font-bold text-sm sm:text-base">
                  {formatAmount(currentExchange.amount)} {currentExchange.pair.from}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Output Amount:</span>                <span className="text-green-400 font-bold text-sm sm:text-base">
                  {formatOutputAmount(outputAmount)} {currentExchange.pair.to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Exchange Rate:</span>
                <span className="text-white text-sm sm:text-base">{formatExchangeRate(currentExchange.rate)}</span>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Counter:</span>
                <span className="text-white text-sm sm:text-base truncate ml-2">{counter.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Commission Rate:</span>
                <span className="text-purple-400 text-sm sm:text-base">{counter.commission}%</span>
              </div>              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Commission Amount:</span>
                <span className="text-yellow-400 font-bold text-sm sm:text-base">{formatCurrency(commission)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-600 pt-3 sm:pt-4">
                <span className="text-gray-400 text-sm sm:text-base">Your Earnings:</span>
                <span className="text-green-400 font-bold text-base sm:text-lg">{formatCurrency(commission)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Exchanger Name */}
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Exchanger Name:</span>
                <span className="text-white text-sm sm:text-base">{meta.changer}</span>
              </div>
              {/* Receiver Location */}
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Receiver Location:</span>
                <span className="text-white text-sm sm:text-base">{meta.receiverLocation}</span>
              </div>
              {/* Transaction ID */}
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Transaction ID:</span>
                <span className="text-white text-sm sm:text-base font-mono">{meta.transactionId}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {!isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCompleteExchange}
              className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
              disabled={counterData.dailyCompletedOrders >= counter.dailyOrders}
              style={counterData.dailyCompletedOrders >= counter.dailyOrders ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <FaPlay className="text-sm sm:text-base" />
              <span>{counterData.dailyCompletedOrders >= counter.dailyOrders ? 'Daily Limit Reached' : 'Complete Exchange'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelExchange}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <FaTimes className="text-sm sm:text-base" />
              <span>Cancel</span>
            </motion.button>
          </motion.div>
        )}        {/* Live Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="frosted p-0 sm:p-0 rounded-2xl overflow-hidden border border-blue-800/40 bg-gradient-to-br from-blue-950/80 via-blue-900/80 to-slate-900/90 shadow-xl"
        >
          <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-blue-800/40 bg-gradient-to-r from-blue-950/70 to-slate-900/80">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-900/30 border border-blue-700/40 shadow-sm">
                <FaGlobe className="text-3xl text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Global Exchange Market</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 bg-green-600/10 border border-green-500/20 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
                    <span className="text-xs text-green-400 font-semibold">LIVE</span>
                  </span>
                  <span className="text-xs text-blue-200 font-medium">24/7 Worldwide</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-blue-200">Updated in real-time</span>
            </div>
          </div>

          {/* Stats Row - Professional, clean, subtle animation */}
          <MarketStatsProfessional />
        </motion.div>

        {/* Global Transactions Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >          <div className="frosted p-4 sm:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaBolt className="text-xl text-blue-400" />
                <h3 className="text-lg font-bold text-white">Live Exchange Activity</h3>
              </div>
              <div className="text-xs text-gray-400">Real-time updates</div>
            </div>
            <ProfessionalTransactionsFeed />
          </div>
            <div className="frosted p-4 sm:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaChartLine className="text-xl text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Available Opportunities</h3>
              </div>
              <div className="text-xs text-gray-400">Updated every 6s</div>
            </div>              <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {lotteryOrders.slice(0, 3).map((order, index) => (
                  <motion.div
                    key={`${order.pair.from}-${order.pair.to}-${order.amount}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    whileHover={{ y: -2 }}
                    className="p-4 bg-slate-800/40 rounded-lg border border-slate-600/50 cursor-pointer hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all duration-300"
                    onClick={() => handleSelectLotteryOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-slate-200">
                          {order.pair.from}/{order.pair.to}
                        </span>
                        <div className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded text-xs text-emerald-400">
                          {(Math.random() * 2 + 0.5).toFixed(2)}% Fee
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400">
                        +${(order.amount * 0.02).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Amount:</span>
                        <div className="text-white font-medium">${formatAmount(order.amount)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Rate:</span>
                        <div className="text-white font-medium">{formatExchangeRate(order.rate)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <button
              onClick={() => setShowLotteryModal(true)}
              className="w-full mt-4 py-3 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 hover:border-slate-500/70 text-slate-200 font-medium rounded-lg transition-all duration-200"
            >
              View All Available Orders
            </button>
          </div>
        </motion.div>

        {/* Footer */}<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 sm:mt-8 mb-4 sm:mb-6"
        >
          <div className="frosted p-4 sm:p-6 rounded-xl text-center">
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Need to go back?</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 mx-auto text-sm sm:text-base"
            >
              <FaHome className="text-sm sm:text-base" />
              <span>Back to Home</span>
            </motion.button>          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
