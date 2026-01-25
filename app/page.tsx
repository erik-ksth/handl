"use client";

import { useState } from "react";
import { LeftDrawer } from "@/components/left-drawer";
import { MainContent } from "@/components/main-content";

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white dark:bg-black font-sans">
      <LeftDrawer isOpen={leftOpen} onToggle={() => setLeftOpen(!leftOpen)} />

      <MainContent leftOpen={leftOpen} rightOpen={false} />
    </div>
  );
}
