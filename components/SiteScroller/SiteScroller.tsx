import { Skeleton } from "@/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from 'lucide-react'
import data from '@/Data/data.json'
import { useStore } from '@/store/store'

export default function SiteScroller() {
  const isDark = useStore((state) => state.isDark)
  
  return (
    <div className="flex flex-row gap-2 w-full px-4 py-4 max700:flex-col max700:gap-4 max700:items-center">
      {Array.from({length:3}).map((_,index)=>(
        <div key={index} className="flex flex-col gap-3 w-1/3 max700:w-full">
          {Array.from({length:20}).map((_,index)=>(
            <Link href="/users/site" key={index} className={`group ${isDark ? 'border rounded-lg border-gray-600' : 'border rounded-lg border-gray-200'}`}>
              <div 
                key={index} 
                className="relative w-full overflow-hidden rounded-[8px]"
              >
                <div className="relative">
                  <Image 
                    src="/bentofolio.png" 
                    alt="placeholder" 
                    width={1000} 
                    height={1000} 
                    className="rounded-[8px] transition-all duration-300 group-hover:scale-105" 
                  />
                  
                  {/* Gradient overlay that appears on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
                      <span className={`text-xl font-medium ${isDark ? 'text-gray-100' : 'text-white'}`}>
                        {data.site.title}
                      </span>
                      <a 
                        href={data.site.visitUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()} 
                        className={`rounded-full p-2 transition-colors ${
                          isDark 
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <ArrowUpRight className={`w-5 h-5 ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

