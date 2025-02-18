'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';
import { PageNavigation } from '@/components/PageNav/PageNavigation';
import { useStore } from "@/store/store";

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
    <div className={`min-h-screen  ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <PageNavigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* User Info Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8 transition-all duration-300 transform hover:scale-[1.02]`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className={`h-12 w-12 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile picture'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className="h-full w-full text-blue-500 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Account Dashboard
            </h1>
          </div>
          {userData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {userData.name}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {userData.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hosted Sites Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transition-all duration-300`}>
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Hosted Sites
              </h2>
              <span className={`px-4 py-2 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {sites.length} {sites.length === 1 ? 'Site' : 'Sites'}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Site Name
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    URL
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Created At
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-6 py-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p className="text-lg">No sites hosted yet</p>
                      <p className="text-sm mt-2">Create your first site to get started</p>
                    </td>
                  </tr>
                ) : (
                  sites.map((site, index) => (
                    <tr key={index} className={`hover:${isDark ? 'bg-gray-750' : 'bg-gray-50'} transition-colors duration-200`}>
                      <td className={`px-6 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {site.siteName}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`https://${site.subdomain}.netlify.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <span>{site.subdomain}.netlify.app</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={site.gistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                            ${isDark 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
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
      </div>
    </div>
  );
}
