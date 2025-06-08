'use client';

import { motion } from 'framer-motion';
import { FaGlobe, FaChartLine, FaUsers, FaHandshake } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Thompson",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Former financial analyst with 15 years of experience in currency markets. Founded FutureFX to make currency exchange accessible to everyone.",
    },
    {
      name: "Sophia Chen",
      role: "CTO",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Tech innovator with a background in AI and financial technology. Leads our engineering team in developing cutting-edge conversion tools.",
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Business Development",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
      bio: "Expert in international business with experience across 5 continents. Passionate about helping businesses go global.",
    },
    {
      name: "Emma Wilson",
      role: "Lead Designer",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      bio: "Award-winning UX/UI designer focused on creating intuitive and beautiful interfaces that make financial tools accessible to all.",
    },
  ];

  const milestones = [
    {
      year: "2018",
      title: "Foundation",
      description: "FutureFX was founded with a mission to democratize access to currency exchange information worldwide.",
    },
    {
      year: "2019",
      title: "First API Launch",
      description: "Released our first public API, enabling developers to integrate currency conversion into their applications.",
    },
    {
      year: "2021",
      title: "Business Solutions",
      description: "Launched our enterprise-grade suite of tools for businesses operating in multiple currencies.",
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Expanded our coverage to over 200 currencies and opened offices in Singapore and London.",
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Introduced AI-powered market analysis tools to help users make informed currency decisions.",
    },
    {
      year: "2025",
      title: "FutureFX 3.0",
      description: "Launched our completely redesigned platform with enhanced features and futuristic interface.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-6 md:px-12 lg:px-24 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                  About FutureFX
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                We're on a mission to make currency exchange information accessible to everyone, everywhere.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="px-6 md:px-12 lg:px-24 py-16 bg-gray-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    Our Mission
                  </span>
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  At FutureFX, we believe that accurate currency information should be available to everyone. Our platform is designed to provide real-time exchange rates and powerful conversion tools for individuals and businesses alike.
                </p>
                <p className="text-lg text-gray-300">
                  Whether you're planning a vacation, managing international business payments, or analyzing market trends, we're here to provide the data and tools you need to make informed decisions.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-30"></div>
                <div className="relative frosted rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div className="frosted p-6 rounded-xl text-center">
                      <FaGlobe className="text-4xl text-blue-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Global Access</h3>
                      <p className="text-gray-400">Serving users from over 190 countries</p>
                    </div>
                    
                    <div className="frosted p-6 rounded-xl text-center">
                      <FaChartLine className="text-4xl text-cyan-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Accurate Data</h3>
                      <p className="text-gray-400">Real-time rates from trusted sources</p>
                    </div>
                    
                    <div className="frosted p-6 rounded-xl text-center">
                      <FaUsers className="text-4xl text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">5M+ Users</h3>
                      <p className="text-gray-400">Trusted by millions worldwide</p>
                    </div>
                    
                    <div className="frosted p-6 rounded-xl text-center">
                      <FaHandshake className="text-4xl text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">1000+ Partners</h3>
                      <p className="text-gray-400">Business integrations globally</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Journey */}
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
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  Our Journey
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                The story of how we've grown and evolved
              </motion.p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500 rounded-full"></div>
              
              <div className="space-y-12 relative">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-start ${
                      index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    } relative`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                      <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {milestone.year}
                      </h3>
                      <h4 className="text-xl font-semibold mb-2">{milestone.title}</h4>
                      <p className="text-gray-400">{milestone.description}</p>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    </div>
                    
                    <div className="w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
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
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  Meet Our Team
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                The people behind FutureFX
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="frosted rounded-xl overflow-hidden"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="object-cover w-full h-60"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-blue-400 mb-3">{member.role}</p>
                    <p className="text-gray-400 text-sm">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
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
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  Our Values
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                The principles that guide everything we do
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="frosted p-8 rounded-xl"
              >
                <h3 className="text-2xl font-bold mb-4 text-blue-400">Accuracy</h3>
                <p className="text-gray-300">
                  We're committed to providing the most accurate and up-to-date currency information. 
                  Our data is sourced from reliable financial institutions and updated in real-time.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="frosted p-8 rounded-xl"
              >
                <h3 className="text-2xl font-bold mb-4 text-purple-400">Accessibility</h3>
                <p className="text-gray-300">
                  We believe financial information should be accessible to everyone. 
                  Our tools are designed to be intuitive and easy to use, regardless of your financial expertise.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="frosted p-8 rounded-xl"
              >
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">Innovation</h3>
                <p className="text-gray-300">
                  We're constantly exploring new technologies and approaches to make currency conversion 
                  faster, more accurate, and more insightful for our users.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-6 md:px-12 lg:px-24 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="frosted p-12 rounded-3xl border border-white/10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to experience the future of currency exchange?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join millions of users who trust FutureFX for their currency conversion needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium text-white border-glow"
                >
                  Start Converting
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full frosted font-medium text-white"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
