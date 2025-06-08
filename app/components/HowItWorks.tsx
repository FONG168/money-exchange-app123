'use client';

import { motion } from 'framer-motion';
import { FaSearch, FaExchangeAlt, FaChartLine, FaDownload } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaSearch className="text-4xl text-blue-400" />,
      title: "Select Currencies",
      description: "Choose from over 200 world currencies in our intuitive dropdown menus. Search by country name or currency code.",
      details: ["Type to search instantly", "Popular currencies at the top", "Flag icons for easy identification"],
      delay: 0.1,
    },
    {
      icon: <FaExchangeAlt className="text-4xl text-purple-400" />,
      title: "Enter Amount",
      description: "Input the amount you want to convert. Our system accepts any positive number with up to 2 decimal places.",
      details: ["Real-time formatting", "Thousands separators", "Auto-correction for invalid inputs"],
      delay: 0.2,
    },
    {
      icon: <FaChartLine className="text-4xl text-cyan-400" />,
      title: "Get Real-time Rates",
      description: "Instantly see the converted amount with our live exchange rates, updated every minute from financial markets.",
      details: ["Live market rates", "Historical comparisons", "Rate change indicators"],
      delay: 0.3,
    },
    {
      icon: <FaDownload className="text-4xl text-green-400" />,
      title: "Save & Share",
      description: "Bookmark your favorite currency pairs, set rate alerts, or share conversion results with colleagues.",
      details: ["Bookmark currency pairs", "Set rate alerts", "Export conversion history"],
      delay: 0.4,
    },
  ];

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Converting currencies has never been easier. Follow these simple steps to get accurate exchange rates instantly.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent transform -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: step.delay,
                  type: "spring",
                  bounce: 0.3
                }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="relative group"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-20">
                  {index + 1}
                </div>

                <div className="frosted p-8 rounded-2xl border border-white/10 h-full relative overflow-hidden">
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: step.delay + 0.2,
                        type: "spring",
                        bounce: 0.5
                      }}
                      viewport={{ once: true }}
                      className="mb-6 flex justify-center"
                    >
                      <div className="p-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10">
                        {step.icon}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 text-center">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-400 text-center mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <motion.div
                          key={detailIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: step.delay + 0.3 + (detailIndex * 0.1)
                          }}
                          viewport={{ once: true }}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0" />
                          {detail}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="frosted p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-400 mb-6">
              Try our currency converter now and experience the fastest, most accurate exchange rates available online.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const converterSection = document.getElementById('converter');
                converterSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium text-white border-glow"
            >
              Try Currency Converter
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;
