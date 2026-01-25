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

interface LeftDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function LeftDrawer({ isOpen, onToggle }: LeftDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex items-center p-4 pointer-events-none">
      <motion.div
        animate={{
          width: isOpen ? 280 : 72,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 1 }}
        className="h-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl text-zinc-600 dark:text-zinc-400 flex flex-row rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50 pointer-events-auto border border-black/5 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300"
      >
        {/* Rail Content (Always visible icons) */}
        <div className="flex flex-col h-full items-center py-6 w-[72px] flex-shrink-0 border-r border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] transition-colors duration-300">

          <div className="my-10">
            {mounted && (
              <Image
                src={theme === "dark" ? "/logo-white.png" : "/logo.png"}
                alt="Handl Logo"
                width={100}
                height={100}
                className="object-contain -rotate-90"
              />
            )}
          </div>

          <div className="flex flex-col gap-4 flex-1 w-full px-2">
            <button className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl transition-all duration-300 text-zinc-700 dark:text-zinc-100 hover:scale-105 active:scale-95 group relative flex justify-center">
              <Plus className="w-5 h-5" />
              {!isOpen && <span className="absolute left-14 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl backdrop-blur-md">New Chat</span>}
            </button>

          </div>

          <div className="mt-auto flex flex-col gap-4 items-center w-full px-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group relative flex justify-center"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
                {!isOpen && (
                  <span className="absolute left-14 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-zinc-800 dark:text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl backdrop-blur-md">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex justify-center text-zinc-600 dark:text-zinc-400"
            >
              {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-900/20 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all border border-white/10">
              EH
            </div>
          </div>
        </div>

        {/* Expanded Panel Content */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex flex-col h-full w-full p-6">

                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 pl-2 transition-colors duration-300">Today</h3>
                    <div className="space-y-1">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-sm py-2.5 px-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer truncate transition-colors duration-300 border border-transparent hover:border-black/5 dark:hover:border-white/5"
                      >
                        Project discovery session
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-sm py-2.5 px-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer truncate transition-colors duration-300 border border-transparent hover:border-black/5 dark:hover:border-white/5"
                      >
                        Initial UI design
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
