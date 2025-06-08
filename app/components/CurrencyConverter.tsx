'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { FaExchangeAlt, FaSyncAlt, FaChartLine } from 'react-icons/fa';

const currencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
];

// Interface for exchange rates data
interface ExchangeRateData {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
  success: boolean;
}

const CurrencyConverter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const titleIsInView = useInView(titleRef, { once: true, margin: "-50px" });
  const formIsInView = useInView(formRef, { once: true, margin: "-50px" });
  const resultIsInView = useInView(resultRef, { once: true, margin: "-50px" });
  
  // Transform values for scroll animations
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.9]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 5]);
  
  // Spring animations for smoother motion
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [displayAmount, setDisplayAmount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
    // Reference to store the interval ID for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);  // Format number in accounting format with thousands separators
  const formatCurrency = (amount: number, currency: string): string => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount).replace(/[A-Z]{3}/, '').trim(); // Remove currency code, keep symbol
    } catch (error) {
      // Fallback for unsupported currencies
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  // Format exchange rate with proper decimal places
  const formatExchangeRate = (rate: number): string => {
    if (rate >= 1) {
      return rate.toLocaleString('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    } else {
      // For rates less than 1, show more decimal places
      return rate.toLocaleString('en-US', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      });
    }
  };

  // Smooth counter animation function
  const animateCounter = (startValue: number, endValue: number, duration: number = 800) => {
    const startTime = performance.now();
    const difference = endValue - startValue;
    
    setIsAnimating(true);

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * easeOut);
      
      setDisplayAmount(currentValue);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateCounter);
      } else {
        setIsAnimating(false);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(updateCounter);
  };

  // Effect to fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/currency?from=${fromCurrency}`);
        const data: ExchangeRateData = await response.json();
        
        if (data.success && data.rates) {
          setExchangeRates(data.rates);
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          setError('Failed to fetch exchange rates');
          // Fallback to previous rates if available
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setError('Failed to connect to exchange rate service');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch rates immediately
    fetchExchangeRates();
    
    // Set up real-time updates every 60 seconds (you can adjust this interval)
    refreshIntervalRef.current = setInterval(fetchExchangeRates, 60000);
      // Cleanup function to clear the interval when component unmounts
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fromCurrency]); // Re-fetch when fromCurrency changes

  // Manual refresh function
  const handleRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    const fetchExchangeRates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/currency?from=${fromCurrency}`);
        const data: ExchangeRateData = await response.json();
        
        if (data.success && data.rates) {
          setExchangeRates(data.rates);
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

    fetchExchangeRates();
    
    // Reset the interval
    refreshIntervalRef.current = setInterval(fetchExchangeRates, 60000);
  };
  // Effect for currency conversion
  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      const toRate = exchangeRates[toCurrency] || 1;
      // Base currency (fromCurrency) is always 1
      const result = amount * toRate;
      const previousAmount = convertedAmount;
      
      setConvertedAmount(result);
      
      // Animate the counter from previous value to new value
      animateCounter(previousAmount, result);
    }
  }, [amount, toCurrency, exchangeRates]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  // Animation variants for different elements
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const slideInVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Calculate exchange rate to display
  const displayRate = Object.keys(exchangeRates).length > 0 
    ? exchangeRates[toCurrency] 
    : 0;

  return (
    <motion.div 
      ref={containerRef}
      style={{ y: springY, opacity, scale: springScale }}
      className="frosted p-6 md:p-8 rounded-2xl w-full max-w-3xl mx-auto relative overflow-hidden"
    >
      {/* Background animated elements */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
        animate={floatingAnimation}
        style={{ rotate }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"
        animate={{
          y: [10, -10, 10],
          x: [-5, 5, -5],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
      
      <motion.div
        ref={titleRef}
        variants={containerVariants}
        initial="hidden"
        animate={titleIsInView ? "visible" : "hidden"}
        className="flex justify-between items-center mb-6"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400"
        >
          Currency Converter
        </motion.h2>
        
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
          aria-label="Refresh rates"
        >
          <FaSyncAlt className={`text-white ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </motion.div>      
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200"
        >
          <p>{error}</p>
        </motion.div>
      )}
      
      <motion.div
        ref={formRef}
        variants={containerVariants}
        initial="hidden"
        animate={formIsInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants} className="mb-6">
          <label className="block text-gray-300 mb-2">Amount</label>
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter amount (e.g., 1,000.00)"
              min="0"
              step="0.01"
            />
            {amount > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-300 font-medium pointer-events-none"
              >
                {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.div>
            )}
          </div>
        </motion.div>        
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-6"
        >
          <motion.div 
            variants={slideInVariants}
            className="md:col-span-2"
          >
            <label className="block text-gray-300 mb-2">From</label>
            <div className="relative">
              <motion.select
                whileFocus={{ scale: 1.02 }}
                whileHover={{ scale: 1.01 }}
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </motion.select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-center">
            <motion.button
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1, 
                rotate: 180,
                backgroundColor: "#1d4ed8"
              }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapCurrencies}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaExchangeAlt className="text-white" />
            </motion.button>
          </div>
          
          <motion.div 
            variants={slideInVariants}
            className="md:col-span-2"
          >
            <label className="block text-gray-300 mb-2">To</label>
            <div className="relative">
              <motion.select
                whileFocus={{ scale: 1.02 }}
                whileHover={{ scale: 1.01 }}
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </motion.select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>      
      <motion.div
        ref={resultRef}
        variants={containerVariants}
        initial="hidden"
        animate={resultIsInView ? "visible" : "hidden"}
        className="bg-gray-800/50 p-4 rounded-xl mb-6 relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(34, 211, 238, 0.1))",
              "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(34, 211, 238, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(45deg, rgba(34, 211, 238, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center relative z-10"
        >
          <div>
            <motion.p 
              variants={slideInVariants}
              className="text-sm text-gray-400"
            >
              Converted Amount
            </motion.p>
            {isLoading ? (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-8 w-40 bg-gray-700 animate-pulse rounded mt-1"
              />
            ) : (
              <div className="flex items-baseline">
                <motion.h3 
                  className={`text-2xl font-bold text-glow transition-all duration-300 ${
                    isAnimating ? 'text-blue-400' : 'text-white'
                  }`}
                  key={Math.round(displayAmount * 100)}
                  initial={{ scale: 1.05, opacity: 0.8, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.05 }}
                >
                  {formatCurrency(displayAmount, toCurrency)}
                </motion.h3>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-2 text-gray-400"
                >
                  {toCurrency}
                </motion.span>
              </div>
            )}
          </div>
          
          <motion.div 
            variants={slideInVariants}
            className="text-right"
          >
            <motion.p 
              variants={slideInVariants}
              className="text-sm text-gray-400"
            >
              Exchange Rate
            </motion.p>
            {isLoading ? (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-6 w-20 bg-gray-700 animate-pulse rounded mt-1 ml-auto"
              />
            ) : (
              <motion.p 
                className="text-gray-300"
                key={displayRate.toFixed(4)}
                initial={{ opacity: 0.7, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05, color: "#60a5fa" }}
              >
                1 {fromCurrency} = {formatExchangeRate(displayRate)} {toCurrency}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="mt-4 flex justify-between items-center text-xs text-gray-500"
        >
          <motion.div 
            variants={slideInVariants}
            className="flex items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaChartLine className="mr-1" />
            </motion.div>
            <span>Live market rates</span>
          </motion.div>
          <motion.div 
            variants={slideInVariants}
            className="flex items-center"
          >
            <FaSyncAlt className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading ? 'Updating...' : `Last updated: ${lastUpdated}`}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>      
      <motion.button
        variants={itemVariants}
        whileHover={{ 
          scale: 1.03,
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
          background: "linear-gradient(45deg, #1d4ed8, #7c3aed)"
        }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg border-glow transition-all"
        onClick={() => window.location.href = '/rates'}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          See More Exchange Rates
        </motion.span>
      </motion.button>
    </motion.div>
  );
};

export default CurrencyConverter;
