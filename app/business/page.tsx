'use client';

import { motion } from 'framer-motion';
import { FaChartLine, FaServer, FaUserTie, FaLock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BusinessSection from '../components/BusinessSection';

export default function BusinessPage() {
  const businessFeatures = [
    {
      icon: <FaChartLine className="text-4xl text-blue-400" />,
      title: "Advanced Market Analytics",
      description: "Get deep insights into currency market trends, historical data, and predictive analytics to inform your business decisions.",
    },
    {
      icon: <FaServer className="text-4xl text-purple-400" />,
      title: "API Integration",
      description: "Seamlessly integrate our powerful currency conversion API into your applications, websites, or business systems.",
    },
    {
      icon: <FaUserTie className="text-4xl text-cyan-400" />,
      title: "Dedicated Account Manager",
      description: "Enterprise accounts receive personalized support from a dedicated account manager who understands your business needs.",
    },
    {
      icon: <FaLock className="text-4xl text-green-400" />,
      title: "Enhanced Security",
      description: "Business-grade encryption and security protocols to protect your data and transactions at all times.",
    },
  ];

  const testimonials = [
    {
      quote: "FutureFX has transformed how our company handles international payments. The API is robust and their customer support is exceptional.",
      author: "Sarah Johnson",
      position: "CFO, TechGlobal Inc.",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
      quote: "As an e-commerce platform operating in 12 countries, accurate currency conversion is critical for us. FutureFX delivers consistently reliable rates.",
      author: "Michael Chen",
      position: "CTO, WorldShop",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      quote: "The business analytics tools have given us insights that have saved us thousands in currency exchange fees. Highly recommended!",
      author: "Elena Rodriguez",
      position: "Director of Finance, Nova Industries",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-6 md:px-12 lg:px-24 mb-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl"></div>
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
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400">
                    Business Solutions
                  </span> that Scale
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg">
                  Unlock the full potential of currency exchange with our premium business tools, API access, and enterprise solutions.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="#pricing">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-medium text-white border-glow"
                    >
                      See Pricing
                    </motion.button>
                  </Link>
                  
                  <Link href="#contact-sales">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 rounded-full frosted font-medium text-white"
                    >
                      Contact Sales
                    </motion.button>
                  </Link>
                </div>
                
                <div className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-400 mr-2" />
                      <span className="text-gray-300">No setup fees or hidden charges</span>
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-400 mr-2" />
                      <span className="text-gray-300">Cancel or change plans anytime</span>
                    </li>
                    <li className="flex items-center">
                      <FaCheckCircle className="text-green-400 mr-2" />
                      <span className="text-gray-300">24/7 premium support</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="relative w-full h-[500px]">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative frosted rounded-2xl overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/dashboard.svg')] opacity-20"></div>
                    <div className="p-8 h-full flex flex-col justify-center items-center">
                      <div className="w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-6 text-center">Business Dashboard</h3>
                        <div className="space-y-4">
                          <div className="frosted p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm text-gray-400">Total Conversions</div>
                                <div className="text-2xl font-bold">12,546</div>
                              </div>
                              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <FaChartLine className="text-blue-400 text-2xl" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="frosted p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-2">Top Currencies</div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <span className="mr-2">🇺🇸</span>
                                  <span>USD</span>
                                </div>
                                <div className="font-mono">32%</div>
                              </div>
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <span className="mr-2">🇪🇺</span>
                                  <span>EUR</span>
                                </div>
                                <div className="font-mono">28%</div>
                              </div>
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <span className="mr-2">🇬🇧</span>
                                  <span>GBP</span>
                                </div>
                                <div className="font-mono">18%</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="frosted p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm text-gray-400">API Requests</div>
                                <div className="text-2xl font-bold">1.2M <span className="text-green-400 text-sm">↑ 8.3%</span></div>
                              </div>
                              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <FaServer className="text-purple-400 text-2xl" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="px-6 md:px-12 lg:px-24 py-16 bg-gray-900/30">
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
                  Business Features
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Powerful tools designed to help your business operate globally
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {businessFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 md:px-12 lg:px-24 py-16">
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
                  What Our Clients Say
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Trusted by businesses worldwide
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="frosted p-6 rounded-2xl border border-white/10"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6 flex-grow">
                      <p className="italic text-gray-300">"{testimonial.quote}"</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.author} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.author}</h4>
                        <p className="text-sm text-gray-400">{testimonial.position}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <BusinessSection />
        </section>

        {/* Contact Sales */}
        <section id="contact-sales" className="px-6 md:px-12 lg:px-24 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="frosted p-8 rounded-2xl border border-white/10">
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl font-bold mb-4"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    Contact Our Sales Team
                  </span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="text-gray-300"
                >
                  Get personalized assistance and learn how FutureFX can help your business
                </motion.p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Email</label>
                  <input
                    type="email"
                    className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@yourcompany.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full bg-gray-900/60 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your business needs"
                  ></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                >
                  <span>Submit Request</span>
                  <FaArrowRight />
                </motion.button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
