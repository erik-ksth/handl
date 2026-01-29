"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from "lucide-react";
import { useEffect, useState } from "react";

import { AuthButton } from "./auth-button";

interface LeftDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function LeftDrawer({ isOpen, onToggle }: LeftDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex flex-col h-full pointer-events-none">
      <motion.div
        animate={{
          width: isOpen ? 280 : 72,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 1 }}
        className="h-full bg-sidebar-bg text-foreground flex flex-row overflow-hidden border-r border-border pointer-events-auto transition-colors duration-300"
      >
        {/* Rail Content (Always visible icons) */}
        <div className="flex flex-col h-full items-center py-6 w-[72px] flex-shrink-0 bg-sidebar-bg z-20">

          <div className="my-6">
            {mounted && (
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image
                  src={theme === "dark" ? "/logo-white.png" : "/logo.png"}
                  alt="Handl Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 flex-1 w-full px-3 mt-8">
            <button className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground group relative flex justify-center">
              <Plus className="w-5 h-5" />
              {!isOpen && <span className="absolute left-14 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">New Chat</span>}
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-4 items-center w-full px-3 mb-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground group relative flex justify-center"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 text-muted-foreground hover:text-foreground flex justify-center"
            >
              {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar-bg">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full w-full p-6 pt-24"
              >
                <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-4 pl-2 uppercase tracking-wider">Today</h3>
                    <div className="space-y-1">
                      <div
                        className="text-sm py-2 px-3 rounded-lg text-foreground hover:bg-muted cursor-pointer truncate transition-colors duration-200"
                      >
                        Project discovery session
                      </div>
                      <div
                        className="text-sm py-2 px-3 rounded-lg text-foreground hover:bg-muted cursor-pointer truncate transition-colors duration-200"
                      >
                        Initial UI design
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auth section at the bottom of the expanded panel */}
                <div className="mt-auto pt-4 border-t border-border">
                  <AuthButton />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
