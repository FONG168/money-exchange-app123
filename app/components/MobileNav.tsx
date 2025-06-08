'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaExchangeAlt, 
  FaChartLine, 
  FaUser, 
  FaHistory,
  FaWallet,
  FaCog
} from 'react-icons/fa';

interface MobileNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // Bottom navigation items for all devices
  const bottomNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { href: '/deposit', label: 'Deposit', icon: <FaWallet /> },
    { href: '/exchange', label: 'Exchange', icon: <FaExchangeAlt /> },
    { href: '/history', label: 'History', icon: <FaHistory /> },
    { href: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  // Side menu items
  const sideNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { href: '/deposit', label: 'Deposit', icon: <FaWallet /> },
    { href: '/exchange', label: 'Exchange', icon: <FaExchangeAlt /> },
    { href: '/history', label: 'History', icon: <FaHistory /> },
    { href: '/profile', label: 'Profile', icon: <FaUser /> },
    { href: '/', label: 'Home', icon: <FaChartLine /> },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop/Mobile Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 p-3 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 text-white md:hidden"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 z-40 p-6 md:hidden"
            >
              <div className="pt-16 space-y-6">
                <div className="text-center pb-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">Money Exchange</h2>
                  <p className="text-gray-400 text-sm">Business Dashboard</p>
                </div>
                
                {sideNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-colors group ${
                        pathname === item.href 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'hover:bg-gray-800/50 text-white hover:text-blue-300'
                      }`}
                    >
                      <span className={`transition-colors ${
                        pathname === item.href ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-300'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">
                        {item.label}
                      </span>
                    </button>
                  </motion.div>
                ))}
                
                <div className="pt-6 border-t border-gray-700">
                  <button
                    onClick={() => router.push('/auth')}
                    className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-red-500/20 transition-colors group text-red-400"
                  >
                    <FaCog className="transition-colors" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>      {/* Bottom Navigation Bar for All Devices */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700 mobile-safe-area z-30">
        <div className="flex justify-around items-center py-2 max-w-md mx-auto">
          {bottomNavItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-colors min-w-0 flex-1 ${
                pathname === item.href 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-blue-300 hover:bg-gray-800/30'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileNav;
