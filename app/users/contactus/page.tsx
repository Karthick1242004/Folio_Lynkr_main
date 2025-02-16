'use client';

import React from 'react';
import { PageNavigation } from '@/components/FormpageNav/PageNavigation';
import { useStore } from '@/store/store';
import { motion } from 'framer-motion';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';

export default function ContactUs() {
  const { isDark, isNavOpen, setIsNavOpen } = useStore();

  const contactInfo = [
    {
      title: 'Email Us',
      icon: <Mail className="w-6 h-6 mb-4" />,
      content: 'support@foliolynkr.com',
      link: 'mailto:support@foliolynkr.com'
    },
    {
      title: 'Call Us',
      icon: <Phone className="w-6 h-6 mb-4" />,
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      title: 'Location',
      icon: <MapPin className="w-6 h-6 mb-4" />,
      content: 'San Francisco, CA',
      link: '#'
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
          WE'RE HERE TO HELP
        </p>
        <h1 className={`name-text-main text-heading-sm md:text-heading-sm lg:text-heading-sm leading-none font-black ${
          isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
        }`}>
          CONTACT US
        </h1>
        <p className={`description-text text-body-base font-light leading-relaxed ${
          isDark ? 'text-white/80' : 'text-black/80'
        }`}>
          Have questions? We'd love to hear from you.
          <br className="hidden sm:block" />
          Send us a message and we'll respond as soon as possible.
        </p>
      </motion.section>

      {/* Contact Info Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 rounded-2xl border text-center ${
                  isDark 
                    ? 'bg-[#1A1A1A] border-gray-800 hover:border-[#E0F01F]' 
                    : 'bg-white border-gray-200 hover:border-[#1F67F0]'
                } transition-all duration-300`}
              >
                <div className={`flex flex-col items-center ${
                  isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'
                }`}>
                  {info.icon}
                  <h2 className="text-xl font-bold mb-4">{info.title}</h2>
                </div>
                <a 
                  href={info.link}
                  className={`description-text hover:underline ${
                    isDark ? 'text-white/80' : 'text-black/80'
                  }`}
                >
                  {info.content}
                </a>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-8 rounded-2xl border ${
              isDark 
                ? 'bg-[#1A1A1A] border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block mb-2 text-sm font-medium ${
                    isDark ? 'text-white/80' : 'text-black/80'
                  }`}>
                    Name
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-[#121212] border-gray-800 text-white' 
                        : 'bg-gray-50 border-gray-200 text-black'
                    }`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className={`block mb-2 text-sm font-medium ${
                    isDark ? 'text-white/80' : 'text-black/80'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-[#121212] border-gray-800 text-white' 
                        : 'bg-gray-50 border-gray-200 text-black'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-medium ${
                  isDark ? 'text-white/80' : 'text-black/80'
                }`}>
                  Message
                </label>
                <textarea
                  rows={6}
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-[#121212] border-gray-800 text-white' 
                      : 'bg-gray-50 border-gray-200 text-black'
                  }`}
                  placeholder="Your message..."
                />
              </div>
              <button 
                type="submit"
                className={`px-8 py-3 rounded-full border flex items-center justify-center gap-2 w-full md:w-auto ${
                  isDark 
                    ? 'border-[#E0F01F] text-[#E0F01F] hover:bg-[#E0F01F] hover:text-black' 
                    : 'border-[#1F67F0] text-[#1F67F0] hover:bg-[#1F67F0] hover:text-white'
                } transition-all duration-300`}
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <section className={`pt-16 pb-2 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`}>
        <div className='text-center'>
          <p className="text-gray-500 text-[10px] font-normal dark:text-gray-400 p-2 fontcss tracking-widest flex items-center justify-center gap-2">
            Powered by <a href='https://calibertech.vercel.app/'><span className={`font-medium ${isDark ? 'text-gray-400' : 'text-black'}`}>@CaliberTech</span></a>
          </p> 
        </div>
      </section>
    </div>
  );
}
