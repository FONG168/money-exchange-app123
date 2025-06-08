'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaPlus, FaMinus, FaQuestionCircle } from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How accurate are your exchange rates?",
      answer: "Our exchange rates are sourced from multiple tier-1 financial institutions and are updated every minute. We provide mid-market rates with a typical accuracy of 99.9%. For business transactions, we recommend checking with your financial institution for the exact rates they offer, as they may include spreads or fees.",
      category: "Rates"
    },
    {
      question: "How often are exchange rates updated?",
      answer: "Exchange rates are updated every minute during market hours (Monday to Friday) and every 15 minutes during weekends. We monitor over 200 currencies and ensure you always have access to the most current market information available.",
      category: "Updates"
    },
    {
      question: "Is there a limit to how much I can convert?",
      answer: "For our free service, you can convert any amount up to $1 million equivalent. Business and Enterprise accounts have higher limits or no limits at all. There are no restrictions on the number of conversions you can perform daily.",
      category: "Limits"
    },
    {
      question: "Do you charge any fees for currency conversion?",
      answer: "Our basic currency conversion tool is completely free to use. We display mid-market rates without any hidden fees or markups. However, if you're using our API or premium features, different pricing plans apply. Always check with your bank or payment provider for their fees when making actual transactions.",
      category: "Pricing"
    },
    {
      question: "Can I use your service for business purposes?",
      answer: "Absolutely! We offer specialized business accounts with features like API access, bulk conversions, rate alerts, and historical data. Our Enterprise plan includes dedicated support, custom integrations, and white-label solutions for larger organizations.",
      category: "Business"
    },
    {
      question: "How do I set up rate alerts?",
      answer: "Rate alerts are available with our Business and Enterprise accounts. Simply select your currency pair, set your target rate, and choose how you'd like to be notified (email, SMS, or push notification). You can set multiple alerts and customize the frequency of notifications.",
      category: "Features"
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take security seriously. All data is encrypted in transit and at rest using industry-standard AES-256 encryption. We don't store personal financial information, and our platform is SOC 2 Type II compliant. We never share your data with third parties without explicit consent.",
      category: "Security"
    },
    {
      question: "Do you offer API access?",
      answer: "Yes, we provide RESTful API access with our Business and Enterprise plans. The API supports real-time rates, historical data, and bulk conversions. We offer comprehensive documentation, SDKs for popular programming languages, and 99.9% uptime SLA.",
      category: "API"
    },
    {
      question: "Which currencies do you support?",
      answer: "We support over 200 currencies including all major global currencies (USD, EUR, GBP, JPY, etc.), emerging market currencies, and even some cryptocurrencies. Our coverage includes both ISO standard codes and common currency symbols for easy identification.",
      category: "Coverage"
    },
    {
      question: "Can I access historical exchange rates?",
      answer: "Historical data is available with our Business and Enterprise accounts. You can access up to 10 years of historical rates with daily, weekly, or monthly intervals. This feature is perfect for trend analysis, reporting, and financial planning.",
      category: "Data"
    }
  ];

  const categories = ["All", ...Array.from(new Set(faqs.map(faq => faq.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <FaQuestionCircle className="text-5xl text-indigo-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get answers to the most common questions about our currency conversion platform and services.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white border-glow'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={`${selectedCategory}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="frosted rounded-xl border border-white/10 overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    {openIndex === index ? (
                      <FaMinus className="text-indigo-400" />
                    ) : (
                      <FaPlus className="text-gray-400" />
                    )}
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-4 border-t border-white/10">
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="pt-4"
                        >
                          <div className="flex items-start space-x-2 mb-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-600/20 text-indigo-300 rounded-full">
                              {faq.category}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="frosted p-8 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-semibold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-400 mb-6">
              Can't find the answer you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-full font-medium text-white"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 frosted rounded-full font-medium text-white border border-white/10"
              >
                Browse Documentation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
