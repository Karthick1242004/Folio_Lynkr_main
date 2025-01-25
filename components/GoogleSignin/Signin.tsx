'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/store';

export function GoogleSignin() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark } = useStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {session ? (
        <>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">
                  {session.user?.name?.charAt(0)}
                </span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-auto bg-white rounded-md shadow-lg py-1 z-10 dark:bg-gray-800">
              <div className="px-4 py-2 border-b dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">
                        {session.user?.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      {session.user?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          )}
        </>
      ) : (
        <button 
          onClick={() => signIn('google')}
          className='text-white bg-black px-4 py-2 rounded-md text-body-sm font-normal dark:text-gray-400 p-2 fontcss tracking-widest flex items-center gap-2'
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
