"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowUp } from "lucide-react";

interface MainContentProps {
  leftOpen: boolean;
  rightOpen: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: any;
}

const EXAMPLES = [
  "Find the cheapest laptop screen repair for a MacBook Pro in San Francisco",
  "Call 5 dentists near me and check availability for a cleaning next week",
  "Get quotes for fixing a cracked iPhone 13 screen",
  "Compare prices for oil changes at mechanics within 5 miles of my location",
  "Call plumbers in downtown Oakland and ask for quotes to fix a leaky faucet",
  "Find the best price for car windshield replacement for a 2019 Honda Civic near me",
  "Check availability at 3 hair salons for a women's haircut this Saturday afternoon",
  "Get estimates from contractors for repainting a 2-bedroom apartment in San Francisco",
  "Call dog groomers in San Jose and compare prices for a large breed bath and nail trim",
  "Find electricians who can install a ceiling fan tomorrow and get their hourly rates"
];

export function MainContent({ leftOpen, rightOpen }: MainContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const timer = setInterval(() => {
      setExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze task");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.analysis,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "An error occurred"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showEmptyState = messages.length === 0;

  return (
    <motion.main
      animate={{
        paddingLeft: leftOpen ? "300px" : "100px",
        paddingRight: rightOpen ? "320px" : "100px",
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="relative flex-1 h-screen w-full flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300 overflow-hidden"
    >
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto h-full relative">

        <AnimatePresence>
          {showEmptyState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0 pointer-events-none"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-24 h-24 md:w-32 md:h-32 relative mb-8"
              >
                <Image
                  src="/logo.png"
                  alt="Handl Logo"
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/logo-white.png"
                  alt="Handl Logo"
                  fill
                  className="object-contain hidden dark:block"
                  priority
                />
              </motion.div>

              <div className="h-8 relative w-full overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={exampleIndex}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute text-center text-lg md:text-xl text-zinc-400 dark:text-zinc-600 font-light tracking-wide"
                  >
                    {EXAMPLES[exampleIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto w-full p-4 md:p-8 space-y-6 scroll-smooth z-10"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 md:p-6 ${msg.role === "user"
                  ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 backdrop-blur-sm"
                  : "bg-transparent w-full"
                  }`}
              >
                {msg.role === "assistant" ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Task Analysis
                    </h3>
                    <pre className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300 font-mono text-sm leading-relaxed overflow-x-auto">
                      {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-lg md:text-xl font-light tracking-tight">
                    {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start w-full px-4 md:px-8"
            >
              <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 flex items-center gap-2 text-zinc-400">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="w-full p-4 md:p-6 z-20 pb-8 pt-12">
          <div className="relative flex items-center w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-800 transition-all shadow-lg shadow-zinc-200/50 dark:shadow-none">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's the task?"
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-4 pl-6 pr-14 min-h-[60px] max-h-[200px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 text-lg font-light leading-relaxed scrollbar-hide focus:outline-none"
              rows={1}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSubmit()}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

      </div>
    </motion.main>
  );
}
