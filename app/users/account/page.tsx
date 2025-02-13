'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Loader from '@/components/Loader/Loader';

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

  useEffect(() => {
    const fetchUserSites = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`https://folio4ubackend-production.up.railway.app/get-user-sites/${session.user.email}`);
        //   https://folio4ubackend-production.up.railway.app/
          const data = await response.json();
          
          if (response.ok) {
            const transformedSites = data.sites.map((site: HostedSite) => ({
              ...site,
              gistUrl: site.gistUrl.replace('githubusercontent.com', 'github.com').replace('/raw/data.json', '')
            }));
            setSites(transformedSites);
            setUserData(data.userData);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* User Info Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Account Dashboard
          </h1>
          {userData && (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                Name: {userData.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Email: {userData.email}
              </p>
            </div>
          )}
        </div>

        {/* Hosted Sites Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Hosted Sites
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Site Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Edit Site
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No sites hosted yet
                    </td>
                  </tr>
                ) : (
                  sites.map((site, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {site.siteName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`https://${site.subdomain}.netlify.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {site.subdomain}.netlify.app
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={site.gistUrl} target="_blank" rel="noopener noreferrer">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200`}>
                          Edit Site
                        </span>
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
