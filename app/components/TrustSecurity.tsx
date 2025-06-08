'use client';

import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaCertificate, FaEye, FaServer, FaCheckCircle } from 'react-icons/fa';

const TrustSecurity = () => {
  const securityFeatures = [
    {
      icon: <FaShieldAlt className="text-4xl text-blue-400" />,
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 Type II compliance and industry-standard encryption protocols.",
      details: ["AES-256 encryption", "SOC 2 Type II certified", "Regular security audits"],
      delay: 0.1,
    },
    {
      icon: <FaLock className="text-4xl text-green-400" />,
      title: "Data Protection",
      description: "Your personal and financial data is protected with end-to-end encryption and zero-knowledge architecture.",
      details: ["Zero data retention", "GDPR compliant", "End-to-end encryption"],
      delay: 0.2,
    },
    {
      icon: <FaCertificate className="text-4xl text-purple-400" />,
      title: "Compliance",
      description: "Fully compliant with international financial regulations and data protection standards.",
      details: ["ISO 27001 certified", "PCI DSS Level 1", "GDPR & CCPA compliant"],
      delay: 0.3,
    },
    {
      icon: <FaEye className="text-4xl text-cyan-400" />,
      title: "Transparency",
      description: "Open about our data sources, security practices, and commitment to user privacy.",
      details: ["Open source components", "Public security policy", "Regular transparency reports"],
      delay: 0.4,
    },
    {
      icon: <FaServer className="text-4xl text-yellow-400" />,
      title: "Infrastructure",
      description: "99.9% uptime guaranteed with redundant systems and global CDN for maximum reliability.",
      details: ["Multi-region deployment", "Automatic failover", "99.9% SLA guarantee"],
      delay: 0.5,
    },
    {
      icon: <FaCheckCircle className="text-4xl text-emerald-400" />,
      title: "Trusted Sources",
      description: "Exchange rates sourced from tier-1 financial institutions and central banks worldwide.",
      details: ["10+ data providers", "Real-time validation", "Cross-source verification"],
      delay: 0.6,
    },
  ];

  const certifications = [
    { name: "SOC 2 Type II", logo: "🛡️" },
    { name: "ISO 27001", logo: "🏆" },
    { name: "PCI DSS", logo: "🔒" },
    { name: "GDPR", logo: "🇪🇺" },
    { name: "CCPA", logo: "🇺🇸" },
    { name: "99.9% SLA", logo: "⚡" },
  ];

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/3 to-cyan-500/3 rounded-full blur-3xl" />
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              Trust & Security
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your security and privacy are our top priorities. We maintain the highest standards of data protection and transparency.
          </p>
        </motion.div>

        {/* Security features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: feature.delay,
                type: "spring",
                bounce: 0.3
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="frosted p-8 rounded-2xl border border-white/10 relative group h-full"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: feature.delay + 0.2,
                    type: "spring",
                    bounce: 0.5
                  }}
                  viewport={{ once: true }}
                  className="mb-6 flex justify-center"
                >
                  <div className="p-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 group-hover:border-white/20 transition-colors">
                    {feature.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-center text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-center mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Features list */}
                <div className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <motion.div
                      key={detailIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: feature.delay + 0.3 + (detailIndex * 0.1)
                      }}
                      viewport={{ once: true }}
                      className="flex items-center text-sm text-gray-500"
                    >
                      <FaCheckCircle className="text-green-400 mr-2 flex-shrink-0" />
                      {detail}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-semibold text-center mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Certifications & Compliance
            </span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.4 + (index * 0.05),
                  type: "spring",
                  bounce: 0.3
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="frosted p-4 rounded-xl border border-white/10 text-center group cursor-pointer"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cert.logo}
                </div>
                <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {cert.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="frosted p-8 md:p-12 rounded-2xl border border-white/10 max-w-4xl mx-auto relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-green-600">
                  <FaShieldAlt className="text-3xl text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Our Security Promise
              </h3>
              
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                We're committed to maintaining the highest standards of security and transparency. 
                Your data is protected by the same enterprise-grade security used by major financial institutions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-blue-400">Zero Data Retention</h4>
                  <p className="text-gray-400 text-sm">We don't store your personal conversion data</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-green-400">Open Source</h4>
                  <p className="text-gray-400 text-sm">Key components are open source for transparency</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-purple-400">24/7 Monitoring</h4>
                  <p className="text-gray-400 text-sm">Continuous security monitoring and threat detection</p>
                </div>
              </div>

              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full font-medium text-white mr-4"
                >
                  View Security Policy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 frosted rounded-full font-medium text-white border border-white/10"
                >
                  Contact Security Team
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrustSecurity;
