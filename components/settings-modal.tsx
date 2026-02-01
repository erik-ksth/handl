"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, updateUser } from "@/utils/db";
import type { User as DbUser } from "@/types/database";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toE164 } from "@/utils/phone-format";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [user, setUser] = useState<DbUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
    });
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const loadUser = async () => {
                setLoading(true);
                const data = await getCurrentUser();
                if (data) {
                    setUser(data);
                    setFormData({
                        full_name: data.full_name || "",
                        phone_number: toE164(data.phone_number) || "",
                    });
                }
                setLoading(false);
            };
            loadUser();
        }
    }, [isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate phone number if provided
        if (formData.phone_number && !isValidPhoneNumber(formData.phone_number)) {
            setPhoneError("Please enter a valid phone number");
            return;
        }
        
        setSaving(true);
        setError(null);
        setPhoneError(null);
        setSuccess(false);

        try {
            const updated = await updateUser({
                full_name: formData.full_name,
                phone_number: formData.phone_number, // Store in E.164 format
            });

            if (updated) {
                setUser(updated);
                setSuccess(true);
                // Close after a short delay to show success state
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 1500);
            } else {
                setError("Failed to update profile. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 italic">Settings</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                                    <p className="text-sm text-zinc-500">Loading your profile...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-8">
                                    {/* Avatar Section (Read only for now) */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                                            {user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                                    <User className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{user?.full_name || "New User"}</h3>
                                            <p className="text-sm text-zinc-500">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                    placeholder="Your display name"
                                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Callback Number</label>
                                            <div className="relative">
                                                <PhoneInput
                                                    international
                                                    countryCallingCodeEditable={false}
                                                    defaultCountry="US"
                                                    value={formData.phone_number}
                                                    onChange={(value) => setFormData(prev => ({ ...prev, phone_number: value || "" }))}
                                                    placeholder="Numbers the AI should use for callbacks"
                                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 transition-all"
                                                />
                                            </div>
                                            {phoneError && (
                                                <p className="text-xs text-red-500 dark:text-red-400">{phoneError}</p>
                                            )}
                                            <p className="text-[10px] text-zinc-400 italic">This number will be provided to businesses in case they need to reach you.</p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Settings saved successfully
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving || loading}
                                            className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-200 dark:shadow-none"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
