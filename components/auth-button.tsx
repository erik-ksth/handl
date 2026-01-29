"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        );
    }

    if (user) {
        return (
            <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md transition-all hover:bg-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white shadow-lg">
                        {user.user_metadata.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt={user.user_metadata.full_name}
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            <UserIcon className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {user.user_metadata.full_name || user.email}
                        </span>
                        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {user.email}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-500 hover:text-white dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <div className="p-2">
            <button
                onClick={handleSignIn}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <LogIn className="h-4 w-4" />
                Sign in with Google
            </button>
        </div>
    );
}
