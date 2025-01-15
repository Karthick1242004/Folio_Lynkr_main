import React from 'react';
import { X } from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { text: 'HOME', isHighlight: true },
    { text: 'ABOUT', isHighlight: false },
    { text: 'PROJECTS', isHighlight: false },
    { text: 'EXPERIENCE', isHighlight: false },
    { text: 'CONTACT', isHighlight: false },
  ];

  return (
    <div className={`fixed inset-0 bg-gradient-to-b from-black/90 to-transparent dark:from-black/95 dark:to-transparent backdrop-blur-sm transform transition-transform duration-300 ${
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
            href="#"
            className={`text-4xl font-big-shoulders font-bold ${
              item.isHighlight
                ? 'text-[#ffffff] dark:text-[#E0F01F]'
                : 'text-black dark:text-white'
            } hover:text-[#ffffff] dark:hover:text-[#E0F01F] transition-colors`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
};