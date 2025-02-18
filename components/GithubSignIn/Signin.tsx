'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRef, useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import Link from 'next/link';

export function GoogleSignin() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark } = useStore();


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
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden z-10 dark:bg-gray-800">
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
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
                  <div className="flex flex-col">
                    <p className="text-base font-medium text-gray-900 dark:text-gray-200">
                      {session.user?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
              <Link href='/users/account'>
                <button className="w-[100%] text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                  Manage your account
                </button>
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
                
              </div>
            </div>
          )}
        </>
      ) : (
        <button 
          onClick={() => signIn('github')}
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          aria-label="Sign in with GitHub"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
          >
            <path
              fill="currentColor"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
