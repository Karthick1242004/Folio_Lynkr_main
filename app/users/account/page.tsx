'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Loader from '@/components/LoaderLight/LoaderLight';
import { PageNavigation } from '@/components/PageNav/PageNavigation';
import { useStore } from "@/store/store";
import { motion } from 'framer-motion';

interface HostedSite {
  siteName: string;
  subdomain: string;
  createdAt: string;
  status: 'active' | 'inactive';
  gistUrl: string;
}

interface UserData {
  email: string;
  name: string;
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<HostedSite[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { isNavOpen, setIsNavOpen, isDark } = useStore();

  useEffect(() => {
    const fetchUserSites = async () => {
      if (session?.user?.name) {
        try {
          const response = await fetch(`https://folio4ubackend-production.up.railway.app/get-user-sites/${session.user.name}`);
          const data = await response.json();
          
          if (response.ok) {
            const transformedSites = data.sites.map((site: HostedSite) => ({
              ...site,
              gistUrl: site.gistUrl
                .split('/raw/')[0]
                .replace('githubusercontent.com', 'github.com')
            }));
            setSites(transformedSites);
            setUserData({
              name: session.user.name,
              email: session.user.email || `${session.user.name}@github.com`
            });
          }
        } catch (error) {
          console.error('Failed to fetch sites:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserSites();
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
      <PageNavigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 pt-20 pb-16"
      >
        <div className={`p-8 rounded-2xl border ${
          isDark 
            ? 'bg-[#1A1A1A] border-gray-800 hover:border-[#E0F01F]' 
            : 'bg-white border-gray-200 hover:border-[#1F67F0]'
        } transition-all duration-300`}>
          <div className="flex items-center space-x-4 mb-8">
            <div className={`h-16 w-16 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile picture'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className={`h-full w-full p-3 ${isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'}`}>
                Account Dashboard
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your profile and hosted sites
              </p>
            </div>
          </div>

          {userData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Name</p>
                <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userData.name}
                </p>
              </div>
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Email</p>
                <p className={`text-lg overflow-auto font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userData.email}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Hosted Sites Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto px-4 pb-16"
      >
        <div className={`rounded-2xl border ${
          isDark 
            ? 'bg-[#1A1A1A] border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-[#E0F01F]' : 'text-[#1F67F0]'}`}>
                Your Hosted Sites
              </h2>
              <span className={`px-4 py-2 overflow-scroll rounded-full text-sm ${
                isDark 
                  ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {sites.length} {sites.length === 1 ? 'Site' : 'Sites'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Site Name
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    URL
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Created At
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        No sites hosted yet
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Create your first site to get started
                      </p>
                    </td>
                  </tr>
                ) : (
                  sites.map((site, index) => (
                    <tr key={index} className={`transition-colors duration-200 ${
                      isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                    }`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {site.siteName}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://${site.subdomain}.netlify.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center space-x-1 ${
                            isDark ? 'text-[#E0F01F] hover:text-[#E0F01F]/80' : 'text-[#1F67F0] hover:text-[#1F67F0]/80'
                          }`}
                        >
                          <span>{site.subdomain}.netlify.app</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 overflow-scroll">
                        <a
                          href={site.gistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2  rounded-lg text-sm font-medium text-[12px] max500:text-[8px] transition-colors duration-200 ${
                            isDark 
                              ? 'bg-[#E0F01F]/10 text-[#E0F01F] hover:bg-[#E0F01F]/20' 
                              : 'bg-[#1F67F0]/10 text-[#1F67F0] hover:bg-[#1F67F0]/20'
                          }`}
                        >
                          Edit Site
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
