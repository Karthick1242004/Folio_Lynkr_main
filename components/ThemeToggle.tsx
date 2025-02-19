import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '../store/store';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useStore();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} p-2 transition-colors`}
    >
      <div className={`relative w-12 h-6 rounded-full  ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
        <div
          className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ${
            isDark ? 'left-7 bg-gray-900' : 'left-1 bg-yellow-500'
          }`}
        />
      </div>
      {isDark ? (
        <Moon className="w-4 h-4 text-gray-400" />
      ) : (
        <Sun className="w-4 h-4 text-yellow-500" />
      )}
    </button>
  );
};