'use client';

import { motion } from 'framer-motion';
import { FaExchangeAlt, FaChartLine, FaGlobe, FaShieldAlt, FaMobileAlt, FaLightbulb } from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: <FaGlobe className="text-3xl text-blue-400" />,
      title: "Global Coverage",
      description: "Access exchange rates for over 200 currencies from around the world, updated in real-time.",
      delay: 0.1,
    },
    {
      icon: <FaChartLine className="text-3xl text-purple-400" />,
      title: "Market Trends",
      description: "View historical charts and analyze currency trends to make informed decisions.",
      delay: 0.2,
    },
    {
      icon: <FaExchangeAlt className="text-3xl text-cyan-400" />,
      title: "Quick Conversion",
      description: "Convert between currencies instantly with our intuitive and fast conversion tools.",
      delay: 0.3,
    },
    {
      icon: <FaShieldAlt className="text-3xl text-green-400" />,
      title: "Secure & Reliable",
      description: "All data is encrypted and secured, ensuring your information is always protected.",
      delay: 0.4,
    },
    {
      icon: <FaMobileAlt className="text-3xl text-yellow-400" />,
      title: "Mobile Friendly",
      description: "Access currency exchange rates on any device, anywhere and anytime you need it.",
      delay: 0.5,
    },
    {
      icon: <FaLightbulb className="text-3xl text-red-400" />,
      title: "Smart Alerts",
      description: "Set up customized rate alerts to be notified when your target exchange rate is reached.",
      delay: 0.6,
    },
  ];

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Powerful Features
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Discover why millions of users trust FutureFX for their currency conversion needs
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="frosted p-6 rounded-2xl border border-white/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full transition-colors">
              Explore All Features
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
