'use client';

import React from 'react';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';
import { useStore } from '@/store/store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock } from 'lucide-react';

export default function AboutUs() {
  const { isDark, isNavOpen, setIsNavOpen } = useStore();

  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Founder & CEO',
      image: '/team/member1.jpg',
      description: 'Visionary leader with 10+ years of experience in tech.',
    },
    // Add more team members
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
          OUR JOURNEY
        </p>
        <h1 className={`name-text text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
          isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
        }`}>
          ABOUT US
        </h1>
        <p className={`description-text text-body-base font-light leading-relaxed ${
          isDark ? 'text-white/80' : 'text-black/80'
        }`}>
          We're building the future of web development,
          <br className="hidden sm:block" />
          making it accessible and elegant for everyone.
        </p>
      </motion.section>

      {/* Values Section */}
      <section className={`py-16 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {['Innovation', 'Excellence', 'Integrity'].map((value, index) => (
              <div 
                key={value}
                className={`p-8 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#121212] border-gray-800 hover:border-[#E0F01F]' 
                    : 'bg-white border-gray-200 hover:border-[#1F67F0]'
                } transition-all duration-300`}
              >
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
                }`}>
                  {value}
                </h3>
                <p className={`description-text ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
        <h2 className={`name-text text-center text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
            isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
          }`}>
            OUR TEAM
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  isDark 
                    ? 'bg-[#121212] border-gray-800 hover:border-[#E0F01F]' 
                    : 'bg-white border-gray-200 hover:border-[#1F67F0]'
                } transition-all duration-300`}
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className={`text-xl font-bold text-center mb-2 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {member.name}
                </h3>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-2">
                  {member.role}
                </p>
                <p className={`text-center description-text ${
                  isDark ? 'text-white/80' : 'text-black/80'
                }`}>
                  {member.description}
                </p>
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
            <h2 className={`name-text text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
              isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
            }`}>
              GET IN TOUCH
            </h2>
            <p className={`description-text text-body-base font-light mb-8 ${
              isDark ? 'text-white/80' : 'text-black/80'
            }`}>
              Let's build something amazing together
            </p>
            <button className={`px-8 py-3 rounded-full border ${
              isDark 
                ? 'border-[#E0F01F] text-[#E0F01F] hover:bg-[#E0F01F] hover:text-black' 
                : 'border-[#1F67F0] text-[#1F67F0] hover:bg-[#1F67F0] hover:text-white'
            } transition-all duration-300`}>
              Contact Us
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
