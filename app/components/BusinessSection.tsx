'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

const BusinessSection = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Basic access to currency exchange rates",
      features: [
        "Access to 50+ currencies",
        "Basic conversion tools",
        "Daily rate updates",
        "Mobile-friendly interface",
      ],
      cta: "Get Started",
      popular: false,
      delay: 0.1,
    },
    {
      name: "Business",
      price: "39.99",
      period: "monthly",
      description: "Advanced features for businesses and professionals",
      features: [
        "Access to 200+ currencies",
        "Advanced conversion tools",
        "Real-time rate updates",
        "API access (5,000 requests/month)",
        "Historical exchange rates",
        "Rate alerts",
        "Premium support",
      ],
      cta: "Get Business Plan",
      popular: true,
      delay: 0.2,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations",
      features: [
        "Access to all currencies",
        "Unlimited API requests",
        "Dedicated account manager",
        "Custom integrations",
        "Priority support",
        "Advanced analytics dashboard",
        "White-label solutions",
      ],
      cta: "Contact Us",
      popular: false,
      delay: 0.3,
    },
  ];

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative" id="business-section">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Business Solutions
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Unlock the full potential of our platform and earn with our business accounts
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: plan.delay }}
              viewport={{ once: true }}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular 
                  ? 'border-2 border-purple-500 border-glow' 
                  : 'border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-4 py-1 rounded-bl-lg font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`p-8 h-full flex flex-col ${plan.popular ? 'frosted bg-gray-900/50' : 'frosted'}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    {plan.price !== "Custom" && <span className="text-sm mr-1">$</span>}
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 ml-1">/{plan.period}</span>}
                  </div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>
                
                <div className="grow">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheck className="text-green-400 mt-1 mr-2 shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"} className="mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {plan.cta}
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400">
            Need a custom solution? <Link href="/contact" className="text-blue-400 hover:underline">Get in touch with our sales team</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessSection;
