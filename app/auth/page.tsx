'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { setUserSession, clearAllUserData } from '../utils/session';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  });
  const [notification, setNotification] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Backend API endpoint
  const API_URL = '/api/auth';

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };  

  // Email validation for professional domains
  const allowedDomains = [
    'gmail.com', 'outlook.com', 'yahoo.com', 'qq.com', 'hotmail.com', 'icloud.com', 'aol.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'msn.com', 'live.com', 'ymail.com', 'me.com', 'gmx.com'
  ];

  function getEmailDomain(email: string) {
    const match = email.match(/@([\w.-]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  function isAllowedDomain(email: string) {
    const domain = getEmailDomain(email);
    return allowedDomains.includes(domain);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification('');
    // Email domain validation for registration
    if (!isLogin) {
      if (!isAllowedDomain(formData.email)) {
        setNotification('Please use a correct and professional email domain (e.g., gmail.com, outlook.com, yahoo.com, qq.com, etc).');
        setIsLoading(false);
        return;
      }
    }
    // Call backend API
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          ...formData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setNotification(data.message || 'An error occurred.');
        setIsLoading(false);
        return;
      }      if (!isLogin) {
        // CLEAR localStorage to prevent data contamination between users
        clearAllUserData();
        console.log('Registration successful, cleared localStorage to prevent data contamination');
        
        // Show success popup
        setShowSuccessPopup(true);
        
        // After successful registration, automatically log in the user
        setTimeout(async () => {
          setShowSuccessPopup(false);
          
          try {
            // Automatically log in the newly registered user
            const loginRes = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'login',
                email: formData.email,
                password: formData.password
              })
            });
            
            const loginData = await loginRes.json();
            if (loginRes.ok) {
              // Store user session in localStorage for persistence
              setUserSession({
                id: loginData.user.id,
                email: loginData.user.email,
                firstName: loginData.user.firstName,
                lastName: loginData.user.lastName
              });
              setNotification('Registration and login successful! Redirecting...');
              setTimeout(() => {
                // Use Next.js router for navigation
                router.push('/dashboard');
              }, 800);
            } else {
              // If auto-login fails, switch to login form with email pre-filled
              setIsLogin(true);
              setFormData({
                email: formData.email,
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                agreeToTerms: false
              });
              setNotification('Registration successful! Please log in with your credentials.');
            }
          } catch (loginError) {
            // If auto-login fails, switch to login form with email pre-filled
            setIsLogin(true);
            setFormData({
              email: formData.email,
              password: '',
              confirmPassword: '',
              firstName: '',
              lastName: '',
              agreeToTerms: false
            });
            setNotification('Registration successful! Please log in with your credentials.');
          }
        }, 1500);
        setIsLoading(false);
        return;      } else {
        // CLEAR localStorage before logging in new user to prevent data contamination
        clearAllUserData();
        console.log('Login successful, cleared localStorage to prevent data contamination');
        
        // Store user session in localStorage for persistence
        setUserSession({
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName
        });
        setNotification('Login successful! Redirecting...');
        setIsLoading(false);
        setTimeout(() => {
          // Use Next.js router for navigation
          router.push('/dashboard');
        }, 800);
        return;
      }
    } catch (err) {
      setNotification('Network error. Please try again.');
      setIsLoading(false);
      return;
    }
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 flex justify-center w-full z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 ease-in-out opacity-100 scale-100 pointer-events-auto animate-fadeInDown font-bold text-lg" style={{ minWidth: '260px', maxWidth: '420px', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
            🎉 Congratulations! Registration successful.
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 flex justify-center w-full z-50 pointer-events-none">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-500 ease-in-out opacity-100 scale-100 pointer-events-auto animate-fadeInDown"
            style={{ minWidth: '260px', maxWidth: '420px', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            <span className="block w-full whitespace-normal break-words">{notification}</span>
            <button
              className="ml-4 text-white/70 hover:text-white transition-colors flex-shrink-0"
              onClick={() => setNotification('')}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Auth Card */}
          <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 p-[1px]">
              <div className="w-full h-full bg-gray-900/95 rounded-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Toggle Buttons */}
              <div className="flex mb-8 bg-gray-800/50 rounded-2xl p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 rounded-xl transition-all duration-300 font-medium ${
                    isLogin 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 rounded-xl transition-all duration-300 font-medium ${
                    !isLogin 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {isLogin ? 'Welcome Back!' : 'Join FutureFX'}
                  </span>
                </h1>
                <p className="text-gray-400">
                  {isLogin 
                    ? 'Sign in to access your currency dashboard' 
                    : 'Create your account and start trading currencies'
                  }
                </p>
              </div>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  <FaGoogle className="text-red-500" />
                  Continue with Google
                </motion.button>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebook />
                    Facebook
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    <FaGithub />
                    GitHub
                  </motion.button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-gray-400">Or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required={!isLogin}
                      />
                    </div>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                )}

                {isLogin ? (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="sr-only" />
                      <div className="relative">
                        <div className="w-4 h-4 bg-gray-700 border-2 border-gray-600 rounded"></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-400">Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                ) : (
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      required={!isLogin}
                    />
                    <span className="text-sm text-gray-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                )}                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>

              {/* Additional Features */}
              {!isLogin && (
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <h3 className="text-white font-medium mb-2">What you'll get:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Real-time currency exchange rates</li>
                    <li>• Personal dashboard and portfolio tracking</li>
                    <li>• Advanced analytics and insights</li>
                    <li>• Priority customer support</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;

/* Add smooth fade/slide animation */
// In globals.css or in a <style jsx global> block, add:
// @keyframes fadeInDown {
//   from { opacity: 0; transform: translateY(-30px) translateX(-50%); }
//   to { opacity: 1; transform: translateY(0) translateX(-50%); }
// }