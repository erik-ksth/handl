"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  History, 
  Sparkles,
  User,
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
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex items-center p-4 pointer-events-none">
      <motion.div
        animate={{
          width: isOpen ? 280 : 72,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="h-full bg-zinc-900 text-zinc-400 flex flex-row rounded-3xl overflow-hidden shadow-2xl pointer-events-auto border border-white/10"
      >
        {/* Rail Content (Always visible icons) */}
        <div className="flex flex-col h-full items-center py-6 w-[72px] flex-shrink-0">
          <div className="mb-8 p-2 text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/20">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            <button className="p-3 hover:bg-zinc-800 rounded-2xl transition-all duration-200 text-zinc-100 hover:scale-105 active:scale-95 group relative">
              <Plus className="w-6 h-6" />
              {!isOpen && <span className="absolute left-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">New Chat</span>}
            </button>
            <button className="p-3 hover:bg-zinc-800 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 group relative">
              <Search className="w-6 h-6" />
              {!isOpen && <span className="absolute left-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Search</span>}
            </button>
            <button className="p-3 hover:bg-zinc-800 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 group relative">
              <History className="w-6 h-6" />
              {!isOpen && <span className="absolute left-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">History</span>}
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-4 items-center">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 hover:bg-zinc-800 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 group relative"
              >
                {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-blue-400" />}
                {!isOpen && (
                  <span className="absolute left-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={onToggle}
              className="p-3 hover:bg-zinc-800 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isOpen ? <PanelLeftClose className="w-6 h-6" /> : <PanelLeftOpen className="w-6 h-6" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-inner cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all">
              EH
            </div>
          </div>
        </div>

        {/* Expanded Panel Content */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 208 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col overflow-hidden border-l border-white/5"
            >
              <div className="flex flex-col h-full w-[208px] p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-white tracking-tight text-lg">Handl</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Today</h3>
                    <div className="space-y-1">
                      <div className="text-sm py-2 px-3 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100 cursor-pointer truncate transition-colors">
                        Project discovery session
                      </div>
                      <div className="text-sm py-2 px-3 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100 cursor-pointer truncate transition-colors">
                        Initial UI design
                      </div>
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
