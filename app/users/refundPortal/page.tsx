'use client';

import React, { useEffect } from 'react';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';
import { useStore } from '@/store/store';
import { motion } from 'framer-motion';
import { Clock, Mail, FileText, AlertCircle, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function RefundPortal() {
  const { isDark, isNavOpen, setIsNavOpen } = useStore();

  const steps = [
    {
      title: 'Refund Process Steps',
      icon: <Receipt className="w-6 h-6 mb-4" />,
      content: [
        'Fill out the refund request form below with your order details',
        'Attach any relevant screenshots or proof of payment',
        'Submit your request and wait for our team to review',
        'You will receive a confirmation email within 24 hours',
        'Refund will be processed within 2-3 business days if approved'
      ]
    },
    {
      title: 'Important Information',
      icon: <AlertCircle className="w-6 h-6 mb-4" />,
      content: [
        'Please email your payment proof to calibertech875@gmail.com',
        'Include your order ID in all communications',
        'Refunds are processed to the original payment method',
        'Keep track of your refund request using the provided reference number'
      ]
    }
  ];
  useEffect(()=>{
    setIsNavOpen(false);
  },[])
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
      <PageNavigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center"
      >
        <p className="text-gray-500 text-body-sm font-normal dark:text-gray-400 p-2 fontcss tracking-widest flex items-center justify-center gap-2 mb-6">
          <Clock className="w-4 h-4" />
          REQUEST A REFUND
        </p>
        <h1 className={`name-text text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
          isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
        }`}>
          REFUND PORTAL
        </h1>
        <p className={`description-text text-body-base font-light leading-relaxed ${
          isDark ? 'text-white/80' : 'text-black/80'
        }`}>
          Submit your refund request and track its status.
          <br className="hidden sm:block" />
          We'll process your request as quickly as possible.
        </p>
      </motion.section>

      {/* Steps Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#1A1A1A] border-gray-800 hover:border-[#E0F01F]' 
                    : 'bg-white border-gray-200 hover:border-[#1F67F0]'
                } transition-all duration-300`}
              >
                <div className={`flex flex-col items-center mb-6 ${
                  isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
                }`}>
                  {step.icon}
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>
                <ul className="space-y-4">
                  {step.content.map((item, i) => (
                    <li 
                      key={i}
                      className={`description-text ${
                        isDark ? 'text-white/80' : 'text-black/80'
                      }`}
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Form */}
      <section className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-8 rounded-2xl border ${
              isDark 
                ? 'bg-[#1A1A1A] border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          >
            <h3 className={`text-xl font-bold mb-6 ${
              isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
            }`}>Refund Request Form</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Order ID</label>
                <input
                  type="text"
                  className="w-full p-2 rounded border bg-transparent dark:text-white"
                  placeholder="Enter your order ID"
                />
              </div>
              
              <div>
                <label className={`block mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Email</label>
                <input
                  type="email"
                  className="w-full p-2 rounded border bg-transparent dark:text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className={`block mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Reason for Refund</label>
                <textarea
                  className="w-full p-2 rounded border bg-transparent dark:text-white"
                  rows={4}
                  placeholder="Please describe your reason for requesting a refund"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-full border ${
                  isDark 
                    ? 'border-[#E0F01F] text-[#E0F01F] hover:bg-[#E0F01F] hover:text-black' 
                    : 'border-[#1F67F0] text-[#1F67F0] hover:bg-[#1F67F0] hover:text-white'
                } transition-all duration-300`}
              >
                Submit Refund Request
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <section className={`pt-16 pb-2 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className={isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'} />
              <span className={`${isDark ? 'text-white/80' : 'text-black/80'}`}>
                calibertech875@gmail.com
              </span>
            </div>
          </motion.div>
        </div>
        <div className='text-center mt-16'>
          <p className="text-gray-500 text-[10px] font-normal dark:text-gray-400 p-2 fontcss tracking-widest flex items-center justify-center gap-2">
            Powered by <a href='https://calibertech.vercel.app/'><span className={`font-medium ${isDark ? 'text-gray-400' : 'text-black'}`}>@CaliberTech</span></a>
          </p> 
        </div>
      </section>
    </div>
  );
}
