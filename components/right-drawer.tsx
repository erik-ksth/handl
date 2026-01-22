"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Info, 
  Bell, 
  PanelRightClose, 
  PanelRightOpen,
  Activity
} from "lucide-react";

interface RightDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RightDrawer({ isOpen, onToggle }: RightDrawerProps) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex items-center p-4 pointer-events-none">
      <motion.div
        animate={{
          width: isOpen ? 320 : 72,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="h-full bg-white dark:bg-zinc-900 flex flex-row-reverse rounded-3xl overflow-hidden shadow-2xl pointer-events-auto border border-zinc-200 dark:border-white/10"
      >
        {/* Rail Content (Always visible icons) */}
        <div className="flex flex-col h-full items-center py-6 w-[72px] flex-shrink-0 border-l border-zinc-100 dark:border-white/5 order-last">
          <div className="mb-8 p-2 text-zinc-500 dark:text-zinc-400">
            <Settings className="w-6 h-6" />
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            <button className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:scale-105 active:scale-95 group relative">
              <Bell className="w-6 h-6" />
              {!isOpen && <span className="absolute right-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Notifications</span>}
            </button>
            <button className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:scale-105 active:scale-95 group relative">
              <Activity className="w-6 h-6" />
              {!isOpen && <span className="absolute right-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Activity</span>}
            </button>
            <button className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:scale-105 active:scale-95 group relative">
              <Info className="w-6 h-6" />
              {!isOpen && <span className="absolute right-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Info</span>}
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-4 items-center">
            <button 
              onClick={onToggle}
              className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:scale-105 active:scale-95"
            >
              {isOpen ? <PanelRightClose className="w-6 h-6" /> : <PanelRightOpen className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel Content */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 248 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col overflow-hidden"
            >
              <div className="flex flex-col h-full w-[248px] p-6">
                <div className="mb-8">
                  <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-lg">Details</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-8 scrollbar-hide">
                  <section>
                    <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between group cursor-pointer">
                        <span className="text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Notifications</span>
                        <div className="w-8 h-4 bg-emerald-500/20 rounded-full flex items-center px-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between group cursor-pointer">
                        <span className="text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Dark Mode</span>
                        <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-end px-1">
                          <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
