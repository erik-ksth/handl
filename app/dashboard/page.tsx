"use client";

import { useState, useCallback, useEffect } from "react";
import { LeftDrawer } from "@/components/left-drawer";
import { MainContent } from "@/components/main-content";
import { SettingsModal } from "@/components/settings-modal";

// Hook to detect mobile screen size
function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelectTask = useCallback((taskId: string | null) => {
    setCurrentTaskId(taskId);
    // Close sidebar on mobile when task is selected
    if (isMobile) {
      setLeftOpen(false);
    }
  }, [isMobile]);

  const handleNewTask = useCallback(() => {
    setCurrentTaskId(null);
    // Close sidebar on mobile when new task is created
    if (isMobile) {
      setLeftOpen(false);
    }
  }, [isMobile]);

  // Called by main content when a new task is created
  const handleTaskCreated = useCallback((taskId: string) => {
    setCurrentTaskId(taskId);
    setTaskRefreshKey(prev => prev + 1); // Trigger sidebar refresh
  }, []);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white dark:bg-black font-sans">
      <LeftDrawer
        isOpen={leftOpen}
        onToggle={() => setLeftOpen(!leftOpen)}
        currentTaskId={currentTaskId}
        onSelectTask={handleSelectTask}
        onNewTask={handleNewTask}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobile={isMobile}
        key={taskRefreshKey} // Force refresh when new task created
      />

      <MainContent
        leftOpen={leftOpen}
        rightOpen={false}
        currentTaskId={currentTaskId}
        onTaskCreated={handleTaskCreated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
