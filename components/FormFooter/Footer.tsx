'use client'
import Link from "next/link"
import Image from "next/image"
import { useStore } from '@/store/store'

export default function Footer() {
    const isDark = useStore((state) => state.isDark)
  return (
    <div className={`${isDark ? 'bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
    <footer className={`max-w-6xl mx-auto px-4 py-1 pt-[6%] max500:!pt-[10%]`}>
      {/* Logo and Description */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Image 
            src={isDark?`/Folio white circle.png`:`/Folio black circle.png`} 
            alt="Logo" 
            width={34} 
            height={34} 
            className="w-12 h-12" 
          />
          <span className={`font-bold !tracking-wide name-text text-2xl ${isDark ? 'text-white' : 'text-black'}`}>
            Folio Lynkr
          </span>
        </div>
        <p className={`text-base max500:text-[14px] max500:leading-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Explore our collection of premium website templates designed to help you build your next project. 
          Find the perfect template that matches your style and requirements, fill out the details and the site is ready and hosted.
        </p>
        <p className={`text-sm mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          This site includes affiliate links.
        </p>
      </div>

      {/* Newsletter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-3 rounded-full border ${
                isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-white border-gray-200 text-black'
              } focus:outline-none max500:!text-[14px] focus:ring-2 focus:ring-gray-200`}
            />
            <button className={`absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full text-sm transition-colors ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}>
              Subscribe
            </button>
          </div>
          <p className={`text-sm mt-2 max500:!text-[12px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Subscribe to our newsletter — just the good stuff, no spam.
          </p>
        </div>
      </div>

      {/* Bottom Links and Copyright */}
      <div className="footer-links-container">
        <div className="flex items-center max500:justify-center gap-6 overflow-x-scroll max500:text-[10px]">
          <Link href="/" className={`text-sm max500:text-[10px] ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Home
          </Link>
          <Link href="/" className={`text-sm max500:text-[10px] ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Templates
          </Link>
          <Link href="/" className={`text-sm max500:text-[10px] ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Privacy Policy
          </Link>
          <Link href="/" className={`text-sm max500:text-[10px] ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Terms & Conditions
          </Link>
          <Link href="/" className={`text-sm max500:text-[10px] ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            About Us
          </Link>
        </div>
        <div className="flex items-center">
          <span className={`ml-4 max500:text-[12px] max500:mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            © 2025 Folio Lynkr - All rights reserved.
          </span>
        </div>
      </div>
      <div className='flex justify-center items-center mt-8 max500:mt-4'>
        <p className={`text-[10px] font-normal p-2 fontcss tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Powered by <a href='https://calibertech.vercel.app/'>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>@CaliberTech</span>
          </a>
        </p> 
      </div>    
    </footer>
    </div>
  )
}