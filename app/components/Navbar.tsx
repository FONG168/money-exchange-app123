'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaExchangeAlt, FaBriefcase, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full py-4 px-6 md:px-12 glass fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
          >
            <FaExchangeAlt className="text-white text-xl" />
          </motion.div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
            FutureFX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white hover:text-blue-400 transition-colors">
            Home
          </Link>
          <Link href="/rates" className="text-white hover:text-blue-400 transition-colors">
            Exchange Rates
          </Link>
          <Link href="/business" className="text-white hover:text-blue-400 transition-colors">
            Business
          </Link>          <Link href="/about" className="text-white hover:text-blue-400 transition-colors">
            About
          </Link>
          <Link 
            href="/auth" 
            className="px-4 py-2 rounded-full frosted hover:bg-blue-700 hover:border-blue-600 transition-all"
          >
            Login
          </Link>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden mt-4 glass rounded-lg py-4 px-6"
        >
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/rates" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Exchange Rates
            </Link>
            <Link 
              href="/business" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Business
            </Link>            <Link 
              href="/about" 
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/auth" 
              className="px-4 py-2 rounded-full frosted hover:bg-blue-700 hover:border-blue-600 transition-all text-center"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
