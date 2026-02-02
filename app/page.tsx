"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquare, Phone, Check, Shield, Zap, Globe, Clock, Layers, Users, Zap as ZapIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black font-sans selection:bg-[#A5CCFF]/30 overflow-x-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A5CCFF]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A5CCFF]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo/logo-full-black.png" alt="Handl Logo" className="h-8 w-auto dark:hidden" />
          <img src="/logo/logo-full-white.png" alt="Handl Logo" className="h-8 w-auto hidden dark:block" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-lg shadow-[#A5CCFF]/10"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A5CCFF]/10 border border-[#A5CCFF]/20 text-[#3d83dd] dark:text-[#A5CCFF] text-xs font-bold mb-4 mx-auto tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Personal Operations</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1] lg:leading-[1.05]">
            From thought<br />
            <span className="text-[#A5CCFF]">to done.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Your personal AI workforce that calls, coordinates, and handles life's logistics while you focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link
              href="/login"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-2xl shadow-[#A5CCFF]/20"
            >
              Try for free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Product Showcase Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 w-full max-w-6xl relative"
        >
          {/* Glass Card Container */}
          <div className="relative rounded-[40px] border border-zinc-200/50 dark:border-white/10 p-4 sm:p-2 bg-zinc-50/30 dark:bg-zinc-900/30 backdrop-blur-3xl shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
            {/* Inner Dashboard Mockup Layout */}
            <div className="flex h-full gap-2 bg-zinc-100/20 dark:bg-zinc-950/20 rounded-[38px] overflow-hidden p-2">
              {/* Sidebar Mockup */}
              <div className="hidden lg:flex flex-col w-64 h-full bg-white/40 dark:bg-zinc-950/40 rounded-[30px] border border-white/40 dark:border-white/5 p-6 space-y-6">
                <div className="h-10 w-2/3 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl" />
                <div className="space-y-3 pt-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-11 w-full rounded-2xl ${i === 1 ? 'bg-[#A5CCFF]/20 border border-[#A5CCFF]/30' : 'bg-zinc-100/30 dark:bg-zinc-800/30'}`} />
                  ))}
                </div>
              </div>

              {/* Main Content Mockup */}
              <div className="flex-1 flex flex-col h-full bg-white/40 dark:bg-zinc-950/40 rounded-[30px] border border-white/40 dark:border-white/5 p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-[#A5CCFF]/20 flex items-center justify-center border border-[#A5CCFF]/30">
                      <MessageSquare className="w-6 h-6 text-[#1d4ed8] dark:text-[#A5CCFF]" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-4 w-40 bg-zinc-300/50 dark:bg-zinc-700/50 rounded-full" />
                      <div className="h-2.5 w-24 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 max-w-2xl">
                  {/* Step 1 */}
                  <div className="flex gap-5 items-start text-left">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <MessageSquare className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex-1 px-6 py-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">YOU</div>
                      <div className="text-sm font-semibold dark:text-zinc-200">"Find the cheapest iPhone 15 screen repair nearby"</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-5 items-start pl-6 text-left">
                    <div className="w-11 h-11 rounded-2xl bg-[#A5CCFF]/20 border border-[#A5CCFF]/40 flex items-center justify-center shrink-0 relative">
                      <Globe className="w-5 h-5 text-[#1d4ed8] dark:text-[#A5CCFF]" />
                      <div className="absolute inset-0 rounded-2xl border-2 border-[#A5CCFF] animate-ping opacity-10" />
                    </div>
                    <div className="flex-1 px-6 py-5 bg-[#A5CCFF]/5 rounded-3xl border border-[#A5CCFF]/20">
                      <div className="text-[11px] font-bold text-[#60a5fa] dark:text-[#A5CCFF] uppercase tracking-[0.2em] mb-2">HANDL AGENT</div>
                      <div className="text-sm font-semibold dark:text-blue-300">Calling 5 shops, checking stock & negotiating...</div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-5 items-start text-left">
                    <div className="w-11 h-11 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0 shadow-xl">
                      <Check className="w-6 h-6 text-white dark:text-zinc-900" />
                    </div>
                    <div className="flex-1 px-6 py-5 bg-zinc-900/[0.03] dark:bg-white/[0.03] rounded-3xl border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm">
                      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">DONE</div>
                      <div className="text-sm font-bold dark:text-white">Best Option: TechFix ($129) - 0.8 mi away</div>
                    </div>
                  </div>
                </div>

                {/* Ambient glow in mockup */}
                <div className="absolute top-[-40%] right-[-20%] w-[80%] h-[80%] bg-[#A5CCFF]/10 blur-[120px] rounded-full pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#A5CCFF]/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#A5CCFF]/10 blur-[80px] rounded-full" />
        </motion.div>
      </main>

      {/* How it Works Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-zinc-100 dark:border-zinc-900">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            How it <span className="text-[#A5CCFF]">works.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-zinc-100 dark:bg-zinc-800 -z-10" />

          {[
            {
              step: "01",
              title: "Draft Your Request",
              desc: "Tell us what you need in plain English. No complex forms, just type it like a message to a friend.",
              icon: <MessageSquare className="w-6 h-6" />
            },
            {
              step: "02",
              title: "Handl Takes Over",
              desc: "Our AI agents get on the phone, browse the web, and negotiate to find your best options.",
              icon: <Zap className="w-6 h-6" />
            },
            {
              step: "03",
              title: "Get Results",
              desc: "Receive a concise summary and the final outcome, delivered straight to your dashboard.",
              icon: <Check className="w-6 h-6" />
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#A5CCFF]/10 dark:bg-[#A5CCFF]/5 border border-[#A5CCFF]/20 flex items-center justify-center text-[#3d83dd] dark:text-[#A5CCFF]">
                  {item.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  {item.step}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8">
            The power of an <span className="text-[#A5CCFF]">Operations Team</span> in your pocket.
          </h2>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto font-medium">
            Stop wasting time on phone menus and coordination emails. Handl takes the lead on any task that requires a human touch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <Phone className="w-8 h-8" />,
              title: "Smart Calling",
              desc: "Our AI agents navigate complex phone menus and talk to real people to get answers or fix problems."
            },
            {
              icon: <Layers className="w-8 h-8" />,
              title: "Logistics Coordination",
              desc: "From local appointments to international travel, we coordinate every detail of your request."
            },
            {
              icon: <ZapIcon className="w-8 h-8" />,
              title: "Instant Execution",
              desc: "Tasks are picked up immediately by our AI workforce, working in parallel to get things done fast."
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Human Synergy",
              desc: "A perfect blend of AI efficiency and human-like interaction to handle cases that simple bots can't."
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Privacy First",
              desc: "Your data is encrypted, and our agents only share the information necessary to complete your task."
            },
            {
              icon: <Check className="w-8 h-8" />,
              title: "Verified Quality",
              desc: "Every task is double-checked for accuracy. If a result isn't perfect, we keep working until it is."
            },
          ].map((feat, i) => (
            <div key={i} className="group p-12 rounded-[50px] border border-zinc-200/50 dark:border-white/5 bg-white dark:bg-zinc-900/30 backdrop-blur-sm hover:border-[#A5CCFF]/40 dark:hover:border-[#A5CCFF]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#A5CCFF]/10">
              <div className="w-16 h-16 rounded-3xl bg-[#A5CCFF]/10 dark:bg-[#A5CCFF]/5 flex items-center justify-center mb-10 text-zinc-900 dark:text-[#A5CCFF] transition-transform group-hover:scale-110 group-hover:rotate-3">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">{feat.title}</h3>
              <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="relative z-10 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/5 pb-16 pt-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo/logo-full-black.png" alt="Handl Logo" className="h-7 w-auto dark:hidden" />
            <img src="/logo/logo-full-white.png" alt="Handl Logo" className="h-7 w-auto hidden dark:block" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
              © 2026 Handl Inc. Built for human potential.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
