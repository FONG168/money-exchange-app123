'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaSave,
  FaWallet,
  FaShieldAlt,
  FaBell,
  FaLanguage,
  FaSignOutAlt,
  FaMoon,
  FaCheck
} from 'react-icons/fa';
import { useMoneyExchange } from '../contexts/MoneyExchangeContext';
import MobileNav from '../components/MobileNav';

export default function ProfilePage() {
  const router = useRouter();
  const { state, dispatch } = useMoneyExchange();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: state.user.firstName || '',
    lastName: state.user.lastName || '',
    email: state.user.email || '',
  });

  // Theme and notification settings (would be part of user preferences in a real app)
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('english');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }
    });
    
    setIsEditing(false);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleSignOut = () => {
    // In a real app, this would clear the auth token
    // For this demo, we'll just redirect to auth page
    router.push('/auth');
  };
  const totalDeposited = state.transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = state.transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate commission from counter.totalEarnings (same as withdrawal page for consistency)
  const totalCommissions = Object.values(state.counters || {})
    .reduce((sum, counter) => sum + (counter.totalEarnings || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          
          {isEditing ? (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center space-x-2"
          >
            <FaCheck />
            <span>Profile updated successfully!</span>
          </motion.div>
        )}

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="frosted p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className="pl-10 w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="pl-10 w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10 w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition-all"
                >
                  <FaSave />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {state.user.firstName?.charAt(0) || 'U'}{state.user.lastName?.charAt(0) || ''}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {state.user.firstName || 'User'} {state.user.lastName || ''}
                  </h3>
                  <p className="text-gray-400 flex items-center">
                    <FaEnvelope className="mr-2" />
                    {state.user.email || 'user@example.com'}
                  </p>
                  <p className="text-gray-400 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Joined: {new Date(state.user.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-blue-400">${state.user.totalBalance.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <p className="text-gray-400 text-sm">Total Commissions</p>
                  <p className="text-2xl font-bold text-purple-400">${totalCommissions.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>        {/* Income Statement Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="frosted p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Income Statement</h2>
              <p className="text-gray-400 mb-4">View detailed financial overview and earnings history</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="bg-green-900/20 border border-green-700/50 px-3 py-1 rounded-lg">
                  <span className="text-green-400">Today's Income: $0.00</span>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/50 px-3 py-1 rounded-lg">
                  <span className="text-blue-400">Total Transactions: {state.transactions.length}</span>
                </div>
              </div>
            </div>
            <Link
              href="/income-statement"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center space-x-2"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
        
        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="frosted p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center">
                <div className="p-2 bg-gray-700 rounded-lg mr-3">
                  <FaMoon className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white">Dark Mode</p>
                  <p className="text-sm text-gray-400">Switch between light and dark themes</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={() => setDarkMode(!darkMode)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center">
                <div className="p-2 bg-gray-700 rounded-lg mr-3">
                  <FaBell className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-white">Notifications</p>
                  <p className="text-sm text-gray-400">Receive alerts for important updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center">
                <div className="p-2 bg-gray-700 rounded-lg mr-3">
                  <FaLanguage className="text-green-400" />
                </div>
                <div>
                  <p className="text-white">Language</p>
                  <p className="text-sm text-gray-400">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="english">English</option>
                <option value="spanish">Español</option>
                <option value="french">Français</option>
                <option value="german">Deutsch</option>
                <option value="chinese">中文</option>
              </select>
            </div>
          </div>
        </motion.div>
        
        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="frosted p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Security</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-gray-700 rounded-lg mr-3">
                  <FaShieldAlt className="text-blue-400" />
                </div>
                <p className="text-white">Password</p>
              </div>
              <Link
                href="#"
                className="block w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-lg transition-colors"
              >
                Change Password
              </Link>
            </div>
            
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-gray-700 rounded-lg mr-3">
                  <FaWallet className="text-green-400" />
                </div>
                <p className="text-white">Payment Methods</p>
              </div>
              <Link
                href="#"
                className="block w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-lg transition-colors"
              >
                Manage Payment Methods
              </Link>
            </div>
          </div>
        </motion.div>
        
        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition-all"
          >
            <FaSignOutAlt />
            <span>Sign Out</span>          </button>
        </motion.div>
      </div>
    </div>
  );
}
