'use client';

import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Testimonials = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "International Business Manager",
      company: "Global Trade Corp",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "This platform has revolutionized how we handle currency conversions. The real-time rates and accuracy are unmatched. We've saved thousands in exchange fees.",
      rating: 5,
      delay: 0.1,
    },
    {
      name: "Michael Chen",
      title: "Financial Analyst",
      company: "Investment Partners LLC",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The API integration was seamless, and the historical data features help us make informed decisions. Customer support is exceptional too.",
      rating: 5,
      delay: 0.2,
    },
    {
      name: "Emma Rodriguez",
      title: "E-commerce Director",
      company: "Online Marketplace Inc",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Managing international payments became so much easier. The mobile app works perfectly, and the rate alerts keep us informed of market changes.",
      rating: 5,
      delay: 0.3,
    },
    {
      name: "David Kim",
      title: "Travel Agency Owner",
      company: "Adventure Travel Co",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "Our clients love the accuracy and speed of conversions. It's become an essential tool for our travel planning services.",
      rating: 5,
      delay: 0.4,
    },
    {
      name: "Lisa Thompson",
      title: "Freelance Developer",
      company: "Independent Contractor",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
      content: "Working with international clients means dealing with multiple currencies daily. This tool makes it effortless and reliable.",
      rating: 5,
      delay: 0.5,
    },
    {
      name: "Robert Wilson",
      title: "Import/Export Manager",
      company: "International Logistics",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      content: "The enterprise features and bulk conversion tools have streamlined our operations significantly. Highly recommended for businesses.",
      rating: 5,
      delay: 0.6,
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`${i < rating ? 'text-yellow-400' : 'text-gray-600'} text-sm`}
        />
      ))}
    </div>
  );

  return (
    <div className="py-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-float-delayed" />
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
              What Our Users Say
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what professionals and businesses say about our platform.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto">
            <div className="frosted p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5" />
              
              <div className="relative z-10">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <FaQuoteLeft className="text-4xl text-yellow-400/50 mx-auto mb-6" />
                  
                  <blockquote className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src={testimonials[activeTestimonial].image}
                      alt={testimonials[activeTestimonial].name}
                      className="w-16 h-16 rounded-full border-2 border-white/20"
                    />
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-white">
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <p className="text-gray-400">
                        {testimonials[activeTestimonial].title}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonials[activeTestimonial].company}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <StarRating rating={testimonials[activeTestimonial].rating} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: testimonial.delay,
                type: "spring",
                bounce: 0.3
              }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setActiveTestimonial(index)}
              className={`cursor-pointer frosted p-6 rounded-xl border transition-all duration-300 ${
                activeTestimonial === index 
                  ? 'border-yellow-400/50 bg-yellow-400/5' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start space-x-3 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border border-white/20"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">
                    {testimonial.title}
                  </p>
                  <StarRating rating={testimonial.rating} />
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeTestimonial === index 
                  ? 'bg-yellow-400 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="frosted p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">
              Join Thousands of Satisfied Users
            </h3>
            <p className="text-gray-400 mb-6">
              Experience the same reliable, accurate currency conversion that our users trust every day.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full font-medium text-white"
            >
              Start Converting Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonials;
