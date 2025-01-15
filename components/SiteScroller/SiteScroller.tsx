import { Skeleton } from "@/ui/skeleton"
import Link from "next/link"

export default function SiteScroller() {
  return (
    <div className="flex flex-row gap-2 w-full px-4 py-4 max700:flex-col max700:gap-4 max700:items-center">
        {Array.from({length:3}).map((_,index)=>(
            <div key={index} className="flex flex-col gap-3 w-1/3 max700:w-full">
                {Array.from({length:20}).map((_,index)=>(
                    <Link href="/users/site" key={index}>
                        <Skeleton 
                            key={index} 
                            className="w-full bg-gray-300 h-[300px] rounded-[8px] "
                        />
                    </Link>
                ))}
            </div>
        ))}
    </div>
  )
}

