'use client'
import Link from "next/link"
import { Heart } from 'lucide-react'
import { useState } from "react"
import siteData from '@/Data/data.json'

export default function Page() {
  const [isLiked, setIsLiked] = useState(false)
  const { site } = siteData

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-1">
        <h1 className="text-[32px] font-bold text-gray-900">
          {site.title}
        </h1>
        <p className="text-[14px] text-gray-400 max-w-[50%]">
          {site.description}
        </p>
        <div className="flex items-center justify-between pt-2 flex-wrap">
          <div className="flex items-center gap-[1px]">
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-sm bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-l-full transition-colors"
            >
              <svg
                viewBox="0 0 16 16"
                className="w-4 h-4"
                fill="currentColor"
              >
                <path d="M8 0L9.99182 1.3121L12.3696 1.29622L13.3431 3.48797L15.3519 4.77336L14.9979 7.14888L16 9.32001L14.4005 11.1777L14.0691 13.5578L11.8437 14.1426L10.2264 16L8 15.308L5.77361 16L4.15632 14.1426L1.93092 13.5578L1.59948 11.1777L0 9.32001L1.00206 7.14888L0.648112 4.77336L2.65693 3.48797L3.63039 1.29622L6.00818 1.3121L8 0Z" />
              </svg>
              Built with {site.builtWith}
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-sm bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-r-full transition-colors"
            >
              {site.signUpText}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`inline-flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-full transition-colors ${
                isLiked ? 'bg-red-500 text-white ' : 'hover:bg-gray-100'
              }`} 
              onClick={()=>setIsLiked(!isLiked)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              Like {isLiked ? 1 : 0}
            </button>
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-full transition-colors hover:bg-gray-100"
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
          <img className="rounded-[10px] overflow-hidden mt-4" src={site.imageUrl} alt={site.title} />
        </div>
      </div>
    </div>
  )
}

