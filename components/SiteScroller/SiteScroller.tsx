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
    <div className="flex flex-row gap-2 w-full px-4 py-4 max700:flex-col max700:gap-4 max700:items-center">
      {data.sites.map((site) => (
        <div key={site.id} className="flex flex-col gap-3 w-1/3 max700:w-full">
          <div 
            onClick={() => handleSiteClick(site.id)}
            className={`group cursor-pointer ${isDark ? 'border rounded-lg border-gray-600' : 'border rounded-lg border-gray-200'}`}
          >
            <div className="relative w-full overflow-hidden rounded-[8px]">
              <div className="relative">
                <Image 
                  src={site.imageUrl}
                  alt={site.title} 
                  width={1000} 
                  height={1000} 
                  className="rounded-[8px] transition-all duration-300 group-hover:scale-105" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
                    <span className={`text-xl font-medium ${isDark ? 'text-gray-100' : 'text-white'}`}>
                      {site.title}
                    </span>
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
        </div>
      ))}
    </div>
  )
}

