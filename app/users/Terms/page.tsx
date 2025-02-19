'use client';

import React, { useEffect } from 'react';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';
import { useStore } from '@/store/store';
import { motion } from 'framer-motion';
import { Clock, Shield, FileText, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  const { isDark, isNavOpen, setIsNavOpen } = useStore();

  const sections = [
    {
      title: 'Terms of Use',
      icon: <FileText className="w-6 h-6 mb-4" />,
      content: [
        'By accessing and using Folio Lynkr, you agree to comply with these Terms and Conditions.',
        'You must be use Folio Lynkr for creating portfolio and not for any other purpose.',
        'You must not use Folio Lynkr for any illegal or unauthorized purpose.',
        'You must not use Folio Lynkr for any purpose that is harmful or harmful to the website or any other users.'
      ]
    },
    {
      title: 'Privacy Policy',
      icon: <Lock className="w-6 h-6 mb-4" />,
      content: [
        'We collect your github profile data to create your portfolio.',
        'Your data is encrypted and stored securely and we do not store your github auth token.',
        'We do not share your personal information with third parties without consent.',
        'We do not sell your data to third parties or any purpose other than creating your portfolio.',
        'We only get your public data from github and your github auth token which you authorize to use when signing in.',
      ]
    },
    {
      title: 'User Conduct',
      icon: <Shield className="w-6 h-6 mb-4" />,
      content: [
        'Users must not engage in any unlawful or prohibited activities.',
        'Content must not violate intellectual property rights.',
        'Users are responsible for all content they publish.'
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
          LAST UPDATED: MARCH 2024
        </p>
        <h1 className={`name-text-main text-heading-sm  max420:text-heading-xs  leading-none font-black ${
          isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
        }`}>
          TERMS & CONDITIONS
        </h1>
        <p className={`description-text text-body-base font-light leading-relaxed ${
          isDark ? 'text-white/80' : 'text-black/80'
        }`}>
          Please read these terms and conditions carefully before using our service.
          <br className="hidden sm:block" />
          By accessing Folio Lynkr, you agree to these terms.
        </p>
      </motion.section>

      {/* Terms Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
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
                  {section.icon}
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <ul className="space-y-4">
                  {section.content.map((item, i) => (
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

      {/* Contact Section */}
      <section className={`pt-16 pb-2 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`name-text-main text-heading-sm font-black mb-8 ${
              isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
            }`}>
              QUESTIONS?
            </h2>
            <p className={`description-text text-body-base font-light mb-8 ${
              isDark ? 'text-white/80' : 'text-black/80'
            }`}>
              If you have any questions about these terms, please contact us
            </p>
            <Link href="/users/contactus" className={`px-8 py-3 rounded-full border ${
              isDark 
                ? 'border-[#E0F01F] text-[#E0F01F] hover:bg-[#E0F01F] hover:text-black' 
                : 'border-[#1F67F0] text-[#1F67F0] hover:bg-[#1F67F0] hover:text-white'
            } transition-all duration-300`}>
              Contact Support
            </Link>
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
