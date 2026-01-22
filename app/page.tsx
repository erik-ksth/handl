"use client";

import { useState } from "react";
import { LeftDrawer } from "@/components/left-drawer";
import { RightDrawer } from "@/components/right-drawer";
import { MainContent } from "@/components/main-content";

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white dark:bg-black font-sans">
      <LeftDrawer isOpen={leftOpen} onToggle={() => setLeftOpen(!leftOpen)} />
      
      <MainContent leftOpen={leftOpen} rightOpen={rightOpen} />

      <RightDrawer isOpen={rightOpen} onToggle={() => setRightOpen(!rightOpen)} />
    </div>
  );
}
