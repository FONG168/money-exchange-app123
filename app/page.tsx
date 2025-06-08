'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Statistics from './components/Statistics';
import HowItWorks from './components/HowItWorks';
import CurrencyConverter from './components/CurrencyConverter';
import Features from './components/Features';
import TrustSecurity from './components/TrustSecurity';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import BusinessSection from './components/BusinessSection';
import Footer from './components/Footer';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax effect for background elements
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  return (
    <div ref={containerRef} className="relative">
      {/* Animated background elements */}
      <motion.div
        style={{ y: backgroundY, opacity }}
        className="fixed inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Hero />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Statistics />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <HowItWorks />
          </motion.div>
          
          <motion.section 
            className="py-16 px-6 md:px-12 relative" 
            id="converter"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Section background animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent"
              animate={{
                background: [
                  "linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.05), transparent)",
                  "linear-gradient(135deg, transparent, rgba(147, 51, 234, 0.05), transparent)",
                  "linear-gradient(135deg, transparent, rgba(34, 211, 238, 0.05), transparent)"
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="max-w-7xl mx-auto relative z-10">
              <CurrencyConverter />
            </div>
          </motion.section>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Features />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <TrustSecurity />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Testimonials />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <FAQ />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <BusinessSection />
          </motion.div>
        </main>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Footer />
        </motion.div>
      </div>
    </div>
  )
}
