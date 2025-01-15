'use client'
import Link from "next/link"
import { Heart } from 'lucide-react'
import { useState } from "react"
import siteData from '@/Data/data.json'
import Image from "next/image"

export default function Page() {
  const [isLiked, setIsLiked] = useState(false)
  const { site } = siteData

  return (
    <div className="max-w-4xl mx-auto px-4 mt-[4%]">
      <div className="space-y-1">
        <h1 className="text-[32px] font-bold text-gray-900">
          {site.title}
        </h1>
        <p className="text-[14px] text-gray-400 max-w-[50%] max500:max-w-[100%]">
          {site.description}
        </p>
        <div className="flex items-center justify-between pt-2 max500:flex-col max500:gap-2 max500:items-start">
          <div className="flex items-center gap-[1px]">
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-sm bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-l-full transition-colors"
            >
              <Image src="/next-js.svg" alt="Next.js" width={16} height={16} />
              Built with <span className="font-semibold">{site.builtWith}</span>
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-sm bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-r-full transition-colors"
            >
              Price: <span className="font-extrabold text-[16px]">₹{site.amount}</span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className={`inline-flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-full transition-colors ${
                isLiked ? 'bg-red-500 text-white ' : 'hover:bg-gray-100'
              }`} 
              onClick={()=>setIsLiked(!isLiked)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              {isLiked ? 'Liked' : 'Like'} {isLiked ? 1 : null}
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
          <img className="rounded-[10px] overflow-hidden mt-4 pb-1" src={site.imageUrl} alt={site.title} />
        </div>
        <div className=" flex items-center max400:flex-col gap-4 border border-blue-100 bg-blue-50 p-4 rounded-[10px]">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <p className="text-sm text-blue-700 flex-1">
            Make this site yours by filling out the form. Press the button to start filling out the form, once you have filled out the form, provide your desired domain name in the provided field.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors">
            Make it yours
          </button>
        </div>
      </div>
    </div>
  )
}

