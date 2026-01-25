"use client";

import { motion } from "framer-motion";

interface MainContentProps {
  leftOpen: boolean;
  rightOpen: boolean;
}

export function MainContent({ leftOpen, rightOpen }: MainContentProps) {
  return (
    <motion.main
      animate={{
        paddingLeft: leftOpen ? "300px" : "100px",
        paddingRight: rightOpen ? "320px" : "100px",
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="flex-1 min-h-screen w-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black transition-colors duration-300"
    >
      <div className="max-w-2xl w-full text-center space-y-8">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Welcome to Handl
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          A minimalist workspace designed for focus.
          Toggle the sidebars to explore your projects and settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-left space-y-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Get Started</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Create your first project to begin organizing your work.</p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-left space-y-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Learn More</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Read our documentation to master the Handl workflow.</p>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
