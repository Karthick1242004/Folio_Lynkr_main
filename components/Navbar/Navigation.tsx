import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const { isDark } = useStore();
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
    <div 
      onClick={handleOverlayClick}
      className={`fixed inset-0 bg-gradient-to-b from-black/90 to-transparent ${
        isDark ? 'from-black/95' : 'from-black/90'
      } to-transparent backdrop-blur-sm transform transition-transform duration-300 ${
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
          <a
            key={item.text}
            href={item.link}
            className={`text-4xl name-text !tracking-normal font-bold ${
              item.isHighlight
                ? isDark ? 'text-[#E0F01F]' : 'text-[#ffffff]'
                : isDark ? 'text-[#E0F01F]' : 'text-white'
            } ${isDark ? 'hover:text-[#E0F01F]' : 'hover:text-[#E0F01F]'} transition-colors`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
};