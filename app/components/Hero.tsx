'use client';

import { motion } from 'framer-motion';
import { FaGlobe, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 pb-12 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-40 left-1/3 w-60 h-60 bg-cyan-500/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                The Future
              </span> of Currency Exchange
            </h1>
            
            <p className="text-xl text-gray-300 max-w-lg">
              Experience real-time currency conversions with our advanced platform. Check daily exchange rates for every country, completely free.
            </p>
              <div className="flex flex-wrap gap-4">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium text-white border-glow"
                >
                  Get Started
                </motion.button>
              </Link>
              
              <Link href="/business">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full frosted font-medium text-white"
                >
                  Business Account
                </motion.button>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 pt-4">
              <div className="flex items-center">
                <FaGlobe className="text-blue-400 mr-2" />
                <span className="text-gray-300">200+ Currencies</span>
              </div>
              <div className="flex items-center">
                <FaShieldAlt className="text-blue-400 mr-2" />
                <span className="text-gray-300">Secure Transactions</span>
              </div>
              <div className="flex items-center">
                <FaChartLine className="text-blue-400 mr-2" />
                <span className="text-gray-300">Real-time Rates</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative frosted rounded-2xl overflow-hidden border border-white/10 p-1">
              <div className="flex items-center justify-center min-h-[400px] w-full">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 w-full max-w-xs text-center relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('/network-grid.svg')] opacity-20"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-2">Live Exchange Rate</h3>
                    <div className="flex justify-center gap-4 my-4">
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-mono mb-1">1.00</div>
                        <div className="bg-blue-600/30 px-3 py-1 rounded-full text-xs">USD</div>
                      </div>
                      <div className="flex items-center text-2xl">=</div>
                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-mono mb-1 text-glow">0.93</div>
                        <div className="bg-purple-600/30 px-3 py-1 rounded-full text-xs">EUR</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-6">
                      <div className="flex justify-between px-2">
                        <span>GBP</span>
                        <span className="font-mono">0.79</span>
                      </div>
                      <div className="flex justify-between px-2">
                        <span>JPY</span>
                        <span className="font-mono">151.82</span>
                      </div>
                      <div className="flex justify-between px-2">
                        <span>CAD</span>
                        <span className="font-mono">1.37</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-xs text-gray-400">
                      <span>Market rates</span>
                      <span>Updated: {time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
