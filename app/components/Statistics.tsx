'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { FaUsers, FaExchangeAlt, FaGlobe, FaClock } from 'react-icons/fa';

const Statistics = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
    const stats = [
    {
      icon: <FaUsers className="text-xl sm:text-2xl text-blue-400" />,
      value: 2500000,
      suffix: "+",
      label: "Active Users",
      description: "Trust our platform daily",
    },
    {
      icon: <FaExchangeAlt className="text-xl sm:text-2xl text-purple-400" />,
      value: 150000000,
      suffix: "+",
      label: "Conversions",
      description: "Processed this month",
    },
    {
      icon: <FaGlobe className="text-xl sm:text-2xl text-cyan-400" />,
      value: 200,
      suffix: "+",
      label: "Currencies",
      description: "Available worldwide",
    },
    {
      icon: <FaClock className="text-xl sm:text-2xl text-green-400" />,
      value: 99.9,
      suffix: "%",
      label: "Uptime",
      description: "Reliable service",
    },
  ];

  const Counter = ({ value, suffix, duration = 2000 }: { value: number, suffix: string, duration?: number }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const countInView = useInView(countRef, { once: true });

    useEffect(() => {
      if (countInView) {
        let startTime: number;
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          
          // Easing function for smooth animation
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(value * easeOut));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(value);
          }
        };
        requestAnimationFrame(animate);
      }
    }, [countInView, value, duration]);    return (
      <span ref={countRef} className="font-bold">
        {count.toLocaleString()}{suffix}
      </span>
    );
  };

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative overflow-hidden" ref={ref}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Trusted by Millions
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join the growing community of users who rely on our platform for accurate, real-time currency exchange data
          </p>
        </motion.div>        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                bounce: 0.3
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                scale: 1.03,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="relative group overflow-hidden"
            >
              {/* Background card with gradient border */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl p-[1px]">
                <div className="w-full h-full bg-gray-900/90 rounded-3xl" />
              </div>
              
              {/* Animated gradient border on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
                <div className="w-full h-full bg-gray-900/95 rounded-3xl" />
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl scale-110" />              {/* Content */}
              <div className="relative z-10 p-3 sm:p-4 lg:p-4 xl:p-5 text-center h-full flex flex-col justify-between min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px]">                {/* Icon with animated background */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    bounce: 0.4
                  }}
                  viewport={{ once: true }}
                  className="mb-2 sm:mb-3 flex justify-center flex-shrink-0"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                    <div className="relative p-1.5 sm:p-2 lg:p-2 xl:p-2.5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 group-hover:border-white/20 transition-colors backdrop-blur-sm">                      <div className="transform group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </motion.div>
                  {/* Counter with enhanced styling */}
                <div className="mb-2 sm:mb-3 flex-shrink-0 overflow-hidden">
                  <div className="text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 group-hover:from-blue-300 group-hover:via-purple-300 group-hover:to-cyan-300 transition-all duration-300 leading-tight break-words">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                </div>
                  {/* Label and description */}
                <div className="space-y-1 sm:space-y-2 flex-grow flex flex-col justify-end">
                  <h3 className="text-sm sm:text-base lg:text-sm xl:text-base font-semibold text-white group-hover:text-gray-100 transition-colors duration-300 leading-tight">
                    {stat.label}
                  </h3>
                  
                  <p className="text-gray-400 group-hover:text-gray-300 text-xs sm:text-sm lg:text-xs xl:text-sm leading-snug transition-colors duration-300 line-clamp-2 px-1">
                    {stat.description}
                  </p>
                </div>

                {/* Animated bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>

              {/* Floating particles effect on hover */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
                <div className="absolute top-6 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
                <div className="absolute bottom-8 left-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '400ms' }} />
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '600ms' }} />
              </div>
            </motion.div>
          ))}
        </div>        {/* Additional info section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16"
        >
          <div className="relative overflow-hidden rounded-3xl">
            {/* Background with gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 p-[1px]">
              <div className="w-full h-full bg-gray-900/90 rounded-3xl" />
            </div>
            
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/network-grid.svg')] bg-repeat animate-pulse" />
            </div>
            
            <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30 group-hover:border-blue-400/50 transition-colors duration-300">
                      <div className="text-2xl sm:text-3xl">⚡</div>
                    </div>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                    Real-time Updates
                  </h4>
                  <p className="text-gray-400 group-hover:text-gray-300 text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    Exchange rates updated every minute from trusted financial sources
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30 group-hover:border-purple-400/50 transition-colors duration-300">
                      <div className="text-2xl sm:text-3xl">🏆</div>
                    </div>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                    Enterprise Grade
                  </h4>
                  <p className="text-gray-400 group-hover:text-gray-300 text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    99.9% uptime with redundant systems and failover protection
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-400/30 group-hover:border-cyan-400/50 transition-colors duration-300">
                      <div className="text-2xl sm:text-3xl">🌍</div>
                    </div>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">
                    Global Reach
                  </h4>
                  <p className="text-gray-400 group-hover:text-gray-300 text-sm sm:text-base leading-relaxed transition-colors duration-300">
                    Serving users in over 190 countries with localized experiences
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;
