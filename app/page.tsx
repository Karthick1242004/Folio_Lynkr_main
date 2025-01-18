'use client';

import Form from "@/components/Form/Form";
import OldForm from "@/components/Form/OldForm";
import { Landing } from "@/components/Landing/Landing";
import SiteOptions from "@/components/SiteOptions/SiteOptions";
import SiteScroller from "@/components/SiteScroller/SiteScroller";
import { useStore } from "@/store/store";

export default function Home() {
  const { isDark } = useStore();
  return (
    <div className={`${isDark ? 'dark bg-[#121212]' : 'bg-[#F0F0F0]'}`}>
    <Landing />
    {/* <OldForm/> */}
    <SiteOptions/>
    <SiteScroller/>
    </div>
  );
}
