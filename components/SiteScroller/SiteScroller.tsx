import { Skeleton } from "@/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from 'lucide-react'
import data from '@/Data/data.json'
import { useStore } from '@/store/store'
import { useRouter } from 'next/navigation'

export default function SiteScroller() {
  const isDark = useStore((state) => state.isDark)
  const router = useRouter()

  const handleSiteClick = (siteId: number) => {
    window.location.href = `/users/site?id=${siteId}`
  }
  
  return (
    <div className="p-2 max-w-[1600px] min1800:max-w-[2000px] mx-auto">
      <div className="grid grid-cols-3 gap-1 min1800:grid-cols-5 max800:grid-cols-1">
        {data.sites.map((site) => (
          <div 
            key={site.id} 
            className="relative overflow-hidden rounded-xl transition-transform duration-300 "
          >
            <div 
              onClick={() => handleSiteClick(site.id)}
              className={`group cursor-pointer h-[240px] ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'
              } rounded-xl border border-gray-700 dark:border-gray-800`}
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <Image 
                  src={site.imageUrl}
                  alt={site.title} 
                  width={1000} 
                  height={1000} 
                  className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                      <span className={`text-xl font-medium ${isDark ? 'text-gray-100' : 'text-white'}`}>
                        {site.title}
                      </span>
                      <span className="text-sm text-gray-300">
                        {site.builtWith}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(site.visitUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className={`rounded-full p-2 transition-colors ${
                        isDark 
                          ? 'bg-gray-800 hover:bg-gray-700' 
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <ArrowUpRight className={`w-5 h-5 ${
                        isDark ? 'text-gray-100' : 'text-gray-900'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

