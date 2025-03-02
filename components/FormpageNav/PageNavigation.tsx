import React from 'react';
import { X } from 'lucide-react';
import { RiMenu2Line } from 'react-icons/ri';
import { ThemeToggle } from '../ThemeToggle';
import { useStore } from '@/store/store';
import Link from 'next/link';
import { GoogleSignin } from '../GithubSignIn/Signin';


interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PageNavigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme, setIsNavOpen } = useStore();
  
  const menuItems = [
    { text: 'HOME', isHighlight: true,link:'/' },
    { text: 'ABOUT US', isHighlight: false,link:'/users/aboutus' },
    { text: 'TERMS & CONDITIONS', isHighlight: false,link:'/users/Terms' },
    { text: 'REFUND POLICY', isHighlight: false,link:'/users/Cancel' },
    { text: 'CONTACT US', isHighlight: false,link:'/users/contactus' },
    { text: 'REFUND PORTAL', isHighlight: false,link:'/users/refundPortal' },
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <header className="flex justify-between z-30 items-center sm:mb-header-spacing max-w-6xl mx-auto pt-3 px-3 max500:pt-5">
        <button className="p-1 sm:p-2" onClick={() => setIsNavOpen(true)} title="Menu">
          <RiMenu2Line size={window.innerWidth <= 500 ? 30 : 38} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <GoogleSignin />
        </div>
      </header>

      <div 
        onClick={handleOverlayClick}
        className={`fixed inset-0 bg-gradient-to-b from-black/90 to-transparent dark:from-black/95 dark:to-transparent backdrop-blur-sm transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50`}
      >
        <div className="flex justify-end p-6" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="p-2" title="Close Navigation">
            <X className="w-8 h-8 text-white" />
          </button>
        </div>
        <nav className="flex flex-col items-start px-8 sm:px-16 pt-8 sm:pt-12 space-y-4" onClick={e => e.stopPropagation()}>
          {menuItems.map((item) => (
            <Link
              key={item.text}
              href={item.link}
              className="text-4xl name-text !tracking-normal font-bold text-white hover:text-[#E0F01F] transition-colors"
            >
              {item.text}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};
  