'use client';

import { Landing } from "@/components/Landing/Landing";
import SiteOptions from "@/components/SiteOptions/SiteOptions";
import SiteScroller from "@/components/SiteScroller/SiteScroller";
import { useStore } from "@/store/store";
import Loader from "@/components/Loader/Loader";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  const { isDark } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center ${isDark ? ' bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
      <Loader />
    </div>;
  }

  return (
    <div className={`${isDark ? 'dark bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
      <Landing />
      <SiteOptions/>
      <SiteScroller/>
      <Footer/>
    </div>
  );
}
