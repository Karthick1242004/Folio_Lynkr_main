import React from 'react';
import { X } from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose, isDark }) => {
  const menuItems = [
    { text: 'HOME', isHighlight: true,link:'/' },
    { text: 'ABOUT', isHighlight: false,link:'/' },
    { text: 'PROJECTS', isHighlight: false,link:'/' },
    { text: 'EXPERIENCE', isHighlight: false,link:'/' },
    { text: 'CONTACT', isHighlight: false,link:'/' },
  ];

  return (
    <div className={`fixed inset-0 bg-gradient-to-b from-black/90 to-transparent ${
      isDark ? 'from-black/95' : 'from-black/90'
    } to-transparent backdrop-blur-sm transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } z-50`}>
      <div className="flex justify-end p-6">
        <button onClick={onClose} className="p-2" title="Close Navigation">
          <X className="w-8 h-8 text-white" />
        </button>
      </div>
      <nav className="flex flex-col items-start px-8 sm:px-16 pt-8 sm:pt-12 space-y-4">
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