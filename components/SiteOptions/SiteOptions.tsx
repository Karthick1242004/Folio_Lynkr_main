import { useStore } from "@/store/store"

export default function SiteOptions() {
  const { isDark } = useStore()
  const options=["All","Portfolio","Blog","Shop","Contact","About","DarkMode"] 
  return (
    <div>
    <div className="flex flex-row justify-center items-center gap-[1%] py-4 fontcss w-full overflow-x-scroll scrollbar-hide">
        {options.map((option)=>(
            <p className={`px-4 py-2  rounded-l-[18px] rounded-r-[18px] text-[11px] font-medium hover:bg-gray-200 hover:transition-all hover:duration-300 active:bg-gray-300 active:transition-all active:duration-300  ${isDark ? 'text-gray-400' : 'text-gray-900'} ${isDark ? 'hover:bg-gray-400' : 'hover:bg-gray-200'} ${isDark ? 'hover:text-gray-900' : 'hover:text-gray-900'} ${isDark ? 'active:bg-gray-200' : 'active:bg-gray-300'}`} key={option}>{option}</p>
        ))}
    </div> 
    </div>
  )
}

 



 
