'use client'
import Link from "next/link"
import { Heart } from 'lucide-react'
import { useState, useEffect } from "react"
import siteData from '@/Data/data.json'
import Image from "next/image"
import { PageNavigation } from '@/components/PageNav/PageNavigation'
import { useStore } from '@/store/store'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Footer from "@/components/Footer/Footer"

export default function Page() {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const searchParams = useSearchParams()
  const siteId = searchParams.get('id')
  const [currentSite, setCurrentSite] = useState(siteData.sites[0])
  const { isNavOpen, setIsNavOpen, isDark } = useStore()
  const { data: session } = useSession()

  useEffect(() => {
    if (siteId) {
      const site = siteData.sites.find(site => site.id === parseInt(siteId))
      if (site) {
        setCurrentSite(site)
        setIsLiked(false)
        setLikeCount(0)
      }
    }
  }, [siteId])

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (currentSite?.title) {
        try {
          const response = await fetch(
            `https://folio4ubackend-production.up.railway.app/get-likes/${encodeURIComponent(currentSite.title)}?userId=${session?.user?.email || ''}`,
            { method: 'GET' }
          );
          const data = await response.json();
          setIsLiked(data.isLiked);
          setLikeCount(data.likeCount);
        } catch (error) {
          console.error('Error fetching like status:', error);
        }
      }
    };

    fetchLikeStatus();
  }, [currentSite.title, session]);

  const handleMakeItYours = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      signIn('google')
    } else {
      window.location.href = currentSite.formUrl
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      signIn('google')
      return
    }

    try {
      const response = await fetch('https://folio4ubackend-production.up.railway.app/toggle-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: currentSite.title,
          userId: session.user?.email
        }),
      });

      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
      <PageNavigation 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
      />
      <div className="max-w-4xl max500:!mt-[7%] mx-auto px-4">
        <div className="space-y-1">
          <h1 className={`text-[32px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentSite.title}
          </h1>
          <p className={`text-[14px] ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-[50%] max500:max-w-[100%]`}>
            {currentSite.description}
          </p>
          <div className="flex items-center justify-between pt-2 max500:flex-col max500:gap-2 max500:items-start">
            <div className="flex items-center gap-[1px]">
              <p className={`inline-flex items-center gap-2 text-sm ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-black/5 hover:bg-black/10'
              } px-3 py-2 rounded-l-full transition-colors ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <Image src="/next-js.svg" alt="Next.js" width={16} height={16} />
                Built with <span className="font-semibold">{currentSite.builtWith}</span>
              </p>
              <p className={`inline-flex items-center gap-2 text-sm ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-black/5 hover:bg-black/10'
              } px-3 py-2 rounded-r-full transition-colors ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Price: <span className="font-extrabold text-[16px]">₹{currentSite.amount}</span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                className={`inline-flex items-center gap-1.5 text-sm border ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                } px-3 py-1.5 rounded-full transition-colors ${
                  isLiked 
                    ? 'bg-red-500 text-white border-red-500' 
                    : isDark 
                      ? 'hover:bg-gray-800 text-gray-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`} 
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                {isLiked ? 'Liked' : 'Like'} {likeCount > 0 ? likeCount : null}
              </button>
              <Link
                href={currentSite.visitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-sm border ${
                  isDark ? ' border-gray-700 hover:bg-gray-800 text-gray-200' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                } px-3 py-1.5 rounded-full transition-colors`}
              >
                Visit
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2.5 8H13.5M13.5 8L8.5 3M13.5 8L8.5 13" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
          <div>
            <Image 
              className="rounded-[10px] overflow-hidden mt-4 pb-1" 
              src={currentSite.imageUrl} 
              alt={currentSite.title} 
              width={1000} 
              height={1000} 
            />
          </div>
          <div className={`flex items-center gap-4 border ${
            isDark ? 'border-blue-800 bg-blue-900/20' : 'border-blue-100 bg-blue-50'
          } p-4 rounded-[10px] max500:px-2 max500:gap-2`}>
            <svg
              className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'} flex-shrink-0`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <p className={`text-sm max500:leading-4 ${
              isDark ? 'text-blue-200' : 'text-blue-700'
            } flex-1 max500:!text-[12px]`}>
              Make this site yours by filling out the form. Press the button to start filling out the form, once you have filled out the form, provide your desired domain name in the provided field.
            </p>
            <Link 
              href="#" 
              onClick={handleMakeItYours} 
              className={`${
                isDark 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-6 py-3 rounded-full text-sm whitespace-nowrap transition-colors max500:px-3 max500:py-2 max500:text-[12px]`}
            >
              Make it yours
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

