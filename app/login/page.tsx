"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Phone, MessageSquare, Sparkles, Smartphone, Stethoscope, Pizza, Users, Truck, ArrowRight } from "lucide-react";

// --- Types & Constants ---

type Scenario = {
    id: string;
    icon: any;
    color: string;
    steps: {
        you: { title: string; text: string };
        agent: { title: string; text: string };
        done: { title: string; text: string };
    };
};

const scenarios: Scenario[] = [
    {
        id: "repair",
        icon: Smartphone,
        color: "blue",
        steps: {
            you: { title: "You", text: "Find the cheapest iPhone 15 screen repair nearby" },
            agent: { title: "AI Agent", text: "Calling 5 shops, checking stock & negotiating..." },
            done: { title: "Done", text: "Best Option: TechFix ($129) - 0.8 mi away" }
        }
    },
    {
        id: "medical",
        icon: Stethoscope,
        color: "emerald",
        steps: {
            you: { title: "You", text: "Find a dentist for a cleaning who takes Delta Dental" },
            agent: { title: "AI Agent", text: "Checking 8 local clinics for insurance coverage..." },
            done: { title: "Confirmed", text: "Dr. Smith (In-Network) @ 2pm Tuesday" }
        }
    },
    {
        id: "food",
        icon: Pizza,
        color: "orange",
        steps: {
            you: { title: "You", text: "Order a large pepperoni pizza from Tony's on Main St" },
            agent: { title: "AI Agent", text: "Calling Tony's Pizza (555-0123) to place order..." },
            done: { title: "Order Placed", text: "Ready for pickup in 20m ($24.50)" }
        }
    },
    {
        id: "recruitment",
        icon: Users,
        color: "violet",
        steps: {
            you: { title: "Business", text: "Call these 10 candidates to schedule initial screenings" },
            agent: { title: "AI Agent", text: "Calling list... verifying interest & availability..." },
            done: { title: "Scheduled", text: "6 interviews set for tomorrow morning" }
        }
    },
    {
        id: "logistics",
        icon: Truck,
        color: "amber",
        steps: {
            you: { title: "Business", text: "Call our supplier to check status of PO #9921" },
            agent: { title: "AI Agent", text: "Contacting Metro Logistics Support..." },
            done: { title: "Update", text: "Shipment delayed, arriving Thursday 9am" }
        }
    }
];

const COLORS = {
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-200", lightBg: "bg-blue-50" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-200", lightBg: "bg-emerald-50" },
    orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-200", lightBg: "bg-orange-50" },
    violet: { bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-200", lightBg: "bg-violet-50" },
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-200", lightBg: "bg-amber-50" },
};

// --- Components ---

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    // A simplified typewriter effect that reveals words
    const words = text.split(" ");

    return (
        <span className="inline-block">
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: delay + i * 0.05,
                        ease: "easeOut"
                    }}
                    className="inline-block mr-1"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
};

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progressTimer = useRef<NodeJS.Timeout | null>(null);
    const supabase = createClient();

    // Auto-rotation logic
    useEffect(() => {
        if (!isPaused) {
            progressTimer.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % scenarios.length);
            }, 6000);
        }
        return () => {
            if (progressTimer.current) clearInterval(progressTimer.current);
        };
    }, [isPaused]);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
        } catch (error) {
            console.error("Error signing in:", error);
            setIsLoading(false);
        }
    };

    const currentScenario = scenarios[currentIndex];
    const currentColor = COLORS[currentScenario.color as keyof typeof COLORS];

    // Background Gradient Animation Variants
    const backgroundVariants = {
        animate: {
            background: `radial-gradient(circle at 50% 50%, ${currentScenario.color === 'blue' ? 'rgba(59, 130, 246, 0.15)' :
                currentScenario.color === 'emerald' ? 'rgba(16, 185, 129, 0.15)' :
                    currentScenario.color === 'orange' ? 'rgba(249, 115, 22, 0.15)' :
                        currentScenario.color === 'violet' ? 'rgba(139, 92, 246, 0.15)' :
                            'rgba(245, 158, 11, 0.15)'}, transparent 70%)`,
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-black font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">

            {/* Right Side - Login Form (Fixed) */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 lg:p-20 order-1 lg:order-2 bg-white dark:bg-black z-20 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none">
                <div className="w-full max-w-sm space-y-10">
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex justify-center mb-8"
                        >
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto dark:hidden" />
                            <img src="/logo-white.png" alt="Logo" className="h-10 w-auto hidden dark:block" />
                        </motion.div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Welcome back
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Sign in to access your personal operations team
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSignIn}
                            disabled={isLoading}
                            className="group w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-500/10 dark:shadow-none"
                        >
                            {isLoading ? (
                                <Loader />
                            ) : (
                                <>
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className="px-8 text-center text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-xs mx-auto">
                        By continuing, you agree to our <a href="#" className="underline dark:hover:text-white hover:text-zinc-900">Terms</a> and <a href="#" className="underline dark:hover:text-white hover:text-zinc-900">Privacy Policy</a>.
                    </p>
                </div>
            </div>

            {/* Left Side - Animated Showcase */}
            <div className="w-full lg:w-[55%] relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 order-2 lg:order-1">

                {/* Dynamic Ambient Background */}
                <motion.div
                    className="absolute inset-0 z-0"
                    animate={{
                        background: [
                            `radial-gradient(circle at 20% 30%, ${currentScenario.color === 'blue' ? 'rgba(59, 130, 246, 0.08)' :
                                currentScenario.color === 'emerald' ? 'rgba(16, 185, 129, 0.08)' :
                                    currentScenario.color === 'orange' ? 'rgba(249, 115, 22, 0.08)' :
                                        currentScenario.color === 'violet' ? 'rgba(139, 92, 246, 0.08)' :
                                            'rgba(245, 158, 11, 0.08)'
                            }, transparent 50%)`,
                            `radial-gradient(circle at 80% 80%, ${currentScenario.color === 'blue' ? 'rgba(59, 130, 246, 0.05)' :
                                currentScenario.color === 'emerald' ? 'rgba(16, 185, 129, 0.05)' :
                                    currentScenario.color === 'orange' ? 'rgba(249, 115, 22, 0.05)' :
                                        currentScenario.color === 'violet' ? 'rgba(139, 92, 246, 0.05)' :
                                            'rgba(245, 158, 11, 0.05)'
                            }, transparent 50%)`
                        ]
                    }}
                    transition={{ duration: 1.5 }}
                />

                <div className="relative z-10 h-full flex flex-col justify-center px-8 lg:px-24 py-12">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 lg:mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                            From thought<br />to done.
                        </h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md">
                            Your personal AI workforce that calls, coordinates, and gets things done.
                        </p>
                    </motion.div>

                    {/* Interactive Timeline Container */}
                    <div
                        className="relative min-h-[340px]"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Connecting Line - Animated Beam */}
                        <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-zinc-200 dark:bg-zinc-800/50 hidden sm:block overflow-hidden rounded-full">
                            <motion.div
                                className={`w-full h-[30%] ${currentColor.bg} absolute top-0 opacity-50 blur-[2px]`}
                                animate={{ top: ["-30%", "130%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                className="space-y-8"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
                                    exit: { opacity: 0, transition: { duration: 0.2 } }
                                }}
                            >
                                {/* Step 1: User Input */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                    className="relative flex gap-6 items-center group"
                                >
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-500 relative z-10">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm flex-1 max-w-md">
                                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{currentScenario.steps.you.title}</div>
                                        <div className="text-zinc-900 dark:text-zinc-200 font-medium">
                                            <TypewriterText text={`"${currentScenario.steps.you.text}"`} delay={0.2} />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Step 2: Agent Action */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                    className="relative flex gap-6 items-center"
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${currentColor.lightBg} dark:bg-zinc-800/80 border ${currentColor.border} dark:border-zinc-700/50 flex items-center justify-center ${currentColor.text} relative z-10`}>
                                        <currentScenario.icon className="w-6 h-6" />
                                        <motion.div
                                            className={`absolute inset-0 rounded-2xl border-2 ${currentColor.border} opacity-0`}
                                            animate={{ opacity: [0, 0.4, 0], scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        />
                                    </div>
                                    <div className={`bg-gradient-to-r from-white/80 to-transparent dark:from-zinc-900/60 dark:to-transparent backdrop-blur-md p-4 rounded-2xl border ${currentColor.border} dark:border-white/5 shadow-sm flex-1 max-w-md`}>
                                        <div className={`flex items-center gap-2 text-[11px] font-bold ${currentColor.text} uppercase tracking-wider mb-1`}>
                                            <Sparkles className="w-3 h-3 animate-pulse" />
                                            <span>{currentScenario.steps.agent.title}</span>
                                        </div>
                                        <div className="text-zinc-600 dark:text-zinc-300 text-sm">
                                            <TypewriterText text={currentScenario.steps.agent.text} delay={1.2} />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Step 3: Result */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                    className="relative flex gap-6 items-center"
                                >
                                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 relative z-10">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <div className="bg-zinc-900/5 dark:bg-white/5 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm flex-1 max-w-md">
                                        <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{currentScenario.steps.done.title}</div>
                                        <div className="text-zinc-900 dark:text-white font-semibold">
                                            <TypewriterText text={currentScenario.steps.done.text} delay={2.2} />
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Timeline Controls */}
                    <div className="mt-8 flex items-center gap-3">
                        {scenarios.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative h-1.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${idx === currentIndex
                                    ? "w-12 bg-zinc-200 dark:bg-zinc-800"
                                    : "w-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                    }`}
                            >
                                {idx === currentIndex && (
                                    <motion.div
                                        className={`absolute inset-0 ${currentColor.bg}`}
                                        initial={{ width: "0%" }}
                                        animate={{ width: isPaused ? "100%" : "100%" }}
                                        // When paused, we just hold full, when running we normally animate, 
                                        // but since simple setInterval flips it, we can just fill it. 
                                        // For true progress bar we'd need a requestAnimationFrame. 
                                        // Visual style: simpler "active state" fill.
                                        layoutId="active-pill"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

function Loader() {
    return <div className="h-5 w-5 animate-spin rounded-full border-2 border-inherit border-t-transparent opacity-50" />;
}
