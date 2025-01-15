import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="max-w-4xl mx-auto px-4 py-1 mt-10">
      {/* Logo and Description */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Image 
            src="/Folio black circle.png" 
            alt="Logo" 
            width={34} 
            height={34} 
            className="w-12 h-12" 
          />
          <span className="font-bold !tracking-wide name-text  text-2xl">Folio Lynkr</span>
        </div>
        <p className="text-gray-600 text-base">
          Explore our collection of premium website templates designed to help you build your next project. 
          Find the perfect template that matches your style and requirements, fill out the details and the site is ready and hosted.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          This site includes affiliate links.
        </p>
      </div>

      {/* Newsletter */}
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Subscribe to our newsletter — just the good stuff, no spam.
          </p>
        </div>
      </div> */}

      {/* Bottom Links and Copyright */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 ">
        <div className="flex items-center gap-6 w-full overflow-x-scroll">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Templates
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Terms & Conditions
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            About Us
          </Link>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm w-full">
          
          <span className="ml-4">© 2025 Folio Lynkr - All rights reserved.</span>
        </div>
      </div>
      <div className='flex justify-center items-center mt-8 py-4'>
           <p className="text-gray-500 text-[10px] font-normal dark:text-gray-400 p-2 fontcss tracking-widest flex items-center gap-2">
            Powered by <a href='https://calibertech.vercel.app/'><span className={`font-medium text-black`}>@CaliberTech</span></a>
           </p> 
          </div>    
    </footer>
  )
}