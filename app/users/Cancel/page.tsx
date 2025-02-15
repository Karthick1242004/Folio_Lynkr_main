'use client';

import React from 'react';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';
import { useStore } from '@/store/store';
import { motion } from 'framer-motion';
import { Clock, RefreshCcw, CreditCard, AlertCircle } from 'lucide-react';

export default function CancellationPolicy() {
  const { isDark, isNavOpen, setIsNavOpen } = useStore();

  const policies = [
    {
      title: 'Cancellation Policy',
      icon: <RefreshCcw className="w-6 h-6 mb-4" />,
      content: [
        'You can cancel your subscription at any time through your account settings.',
        'Cancellation will take effect at the end of your current billing period.',
        'You will retain access to all features until the end of your paid period.'
      ]
    },
    {
      title: 'Refund Policy',
      icon: <CreditCard className="w-6 h-6 mb-4" />,
      content: [
        'We offer a 14-day money-back guarantee for new subscriptions.',
        'Refunds are processed within 5-7 business days.',
        'Partial refunds may be available for annual subscriptions.'
      ]
    },
    {
      title: 'Important Notes',
      icon: <AlertCircle className="w-6 h-6 mb-4" />,
      content: [
        'Refund requests must be submitted through our support system.',
        'Custom domain and add-on purchases are non-refundable.',
        'We reserve the right to deny refunds in cases of policy abuse.'
      ]
    }
  ];

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
          EFFECTIVE FROM MARCH 2024
        </p>
        <h1 className={`name-text text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
          isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
        }`}>
          REFUND POLICY
        </h1>
        <p className={`description-text text-body-base font-light leading-relaxed ${
          isDark ? 'text-white/80' : 'text-black/80'
        }`}>
          We want you to be completely satisfied with our services.
          <br className="hidden sm:block" />
          Here's everything you need to know about cancellations and refunds.
        </p>
      </motion.section>

      {/* Policy Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 gap-8">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.title}
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
                  {policy.icon}
                  <h2 className="text-2xl font-bold">{policy.title}</h2>
                </div>
                <ul className="space-y-4">
                  {policy.content.map((item, i) => (
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

      {/* Support Section */}
      <section className={`pt-16 pb-2 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`name-text text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
              isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
            }`}>
              NEED HELP?
            </h2>
            <p className={`description-text text-body-base font-light mb-8 ${
              isDark ? 'text-white/80' : 'text-black/80'
            }`}>
              Our support team is here to assist you with cancellations and refunds
            </p>
            <button className={`px-8 py-3 rounded-full border ${
              isDark 
                ? 'border-[#E0F01F] text-[#E0F01F] hover:bg-[#E0F01F] hover:text-black' 
                : 'border-[#1F67F0] text-[#1F67F0] hover:bg-[#1F67F0] hover:text-white'
            } transition-all duration-300`}>
              Contact Support
            </button>
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
