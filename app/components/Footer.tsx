'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaExchangeAlt, FaTwitter, FaLinkedin, FaFacebook, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about" },
        { text: "Careers", href: "/careers" },
        { text: "Press", href: "/press" },
        { text: "Blog", href: "/blog" },
        { text: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Services",
      links: [
        { text: "Currency Converter", href: "/converter" },
        { text: "Exchange Rates", href: "/rates" },
        { text: "Business Solutions", href: "/business" },
        { text: "API Documentation", href: "/api-docs" },
        { text: "Partner with Us", href: "/partners" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help Center", href: "/help" },
        { text: "FAQs", href: "/faqs" },
        { text: "Tutorials", href: "/tutorials" },
        { text: "Glossary", href: "/glossary" },
        { text: "Market News", href: "/news" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Terms of Service", href: "/terms" },
        { text: "Privacy Policy", href: "/privacy" },
        { text: "Cookie Policy", href: "/cookies" },
        { text: "Security", href: "/security" },
        { text: "Compliance", href: "/compliance" },
      ],
    },
  ];

  return (
    <footer className="mt-16 pt-16 pb-8 px-6 md:px-12 lg:px-24 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
              >
                <FaExchangeAlt className="text-white text-sm" />
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                FutureFX
              </span>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-sm">
              FutureFX provides modern currency conversion solutions with real-time exchange rates for individuals and businesses worldwide.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <FaTwitter className="text-gray-300" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <FaLinkedin className="text-gray-300" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <FaFacebook className="text-gray-300" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <FaInstagram className="text-gray-300" />
              </a>
            </div>
          </div>
          
          {footerLinks.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} FutureFX. All rights reserved.
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <FaEnvelope className="mr-2" />
                <a href="mailto:contact@futurefx.com" className="hover:text-blue-400 transition-colors">
                  contact@futurefx.com
                </a>
              </div>
              <div className="flex items-center">
                <FaPhoneAlt className="mr-2" />
                <a href="tel:+11234567890" className="hover:text-blue-400 transition-colors">
                  +1 (123) 456-7890
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
