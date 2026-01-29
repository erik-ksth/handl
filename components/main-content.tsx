"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowUp, Phone, Loader2, CheckCircle, XCircle, Play, FileText, Plus, Trash2, Search, MapPin, Navigation } from "lucide-react";

interface AnalysisResult {
    responseType?: "task_update" | "conversation";
    reply?: string;
    callType: "call_businesses" | "call_specific_number" | null;
    hasAllRequiredInfo: boolean;
    extractedInfo: {
        service: string | null;
        serviceDetails: string | null;
        location: string | null;
        budget: string | null;
        timeConstraints: string | null;
        preferredCriteria: "cheapest" | "fastest" | "nearest" | "best_rated" | null;
        phoneNumbers: Array<{ name?: string; phoneNumber: string }>;
        questionsToAsk: string[];
        additionalNotes: string | null;
        userName?: string | null;
        callbackNumber?: string | null;
        [key: string]: any;
    };
    missingInfo: Array<{
        field: string;
        reason: string;
        question: string;
        type: "text" | "select" | "number" | "tel" | "date";
        required: boolean;
        options?: string[];
        placeholder?: string;
    }>;
    callObjective: string | null;
}

interface MainContentProps {
    leftOpen: boolean;
    rightOpen: boolean;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string | AnalysisResult;
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

function MissingInfoField({ info, value, onChange }: { info: any, value: string, onChange: (val: string) => void }) {
    const isOtherSelected = value.toLowerCase() === "other";

    return (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {info.field.replace('_', ' ')}
                </span>
                {info.required && (
                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">Required</span>
                )}
            </div>
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{info.question}</p>

            <div className="space-y-3">
                <div className="flex gap-2">
                    {info.type === "select" ? (
                        <select
                            value={isOtherSelected ? "other" : value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 cursor-pointer"
                        >
                            <option value="" disabled>Select an option...</option>
                            {info.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : info.type === "textarea" ? (
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={info.placeholder || `Enter ${info.field.replace('_', ' ')}...`}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 min-h-[80px] resize-none"
                        />
                    ) : (
                        <input
                            type={info.type}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={info.placeholder || `Enter ${info.field.replace('_', ' ')}...`}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                        />
                    )}
                </div>

                {isOtherSelected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Please specify..."
                            autoFocus
                            value={value === "other" ? "" : value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                        />
                    </motion.div>
                )}
            </div>
            <p className="text-[10px] text-zinc-400 italic">{info.reason}</p>
        </div>
    );
}

function AnalysisFormGroup({ missingInfo, onSubmit }: { missingInfo: any[], onSubmit: (answers: string) => void }) {
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFieldChange = (field: string, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = missingInfo.every(info => {
        if (!info.required) return true;
        const val = formValues[info.field];
        return val && val.trim() !== "" && val.toLowerCase() !== "other";
    });

    const handleSubmit = () => {
        const summary = missingInfo
            .map(info => {
                const val = formValues[info.field];
                return val ? `${info.field.replace('_', ' ')}: ${val}` : null;
            })
            .filter(Boolean)
            .join(", ");

        setIsSubmitted(true);
        onSubmit(`I've provided the missing details: ${summary}`);
    };

    if (isSubmitted) return null;

    return (
        <div className="mt-8 space-y-6 border-t border-zinc-100 dark:border-zinc-800 pt-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase rounded tracking-wider">
                    Interactive
                </div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Provide Missing Info</h4>
            </div>

            <div className="space-y-4">
                {missingInfo.map((info, i) => (
                    <MissingInfoField
                        key={i}
                        info={info}
                        value={formValues[info.field] || ""}
                        onChange={(val) => handleFieldChange(info.field, val)}
                    />
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    disabled={!isFormValid}
                    className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-zinc-200 dark:shadow-none"
                >
                    Submit All Details
                </button>
            </div>
        </div>
    );
}

function SummaryItem({ label, value }: { label: string, value: any }) {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</span>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{value}</p>
        </div>
    );
}

interface PhoneEntry {
    name: string;
    phoneNumber: string;
}

function PhoneNumberCollector({ 
    allowMultiple, 
    onSubmit,
    serviceName,
    initialLocation 
}: { 
    allowMultiple: boolean; 
    onSubmit: (phoneNumbers: Array<{ name?: string; phoneNumber: string }>) => void;
    serviceName?: string | null;
    initialLocation?: string | null;
}) {
    const [phoneEntries, setPhoneEntries] = useState<PhoneEntry[]>([{ name: '', phoneNumber: '' }]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [locationInput, setLocationInput] = useState(initialLocation || '');
    const [isSearching, setIsSearching] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; place_id: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const hasAutoSelectedRef = useRef(false);

    // Auto-fetch and select first suggestion when initialLocation is provided
    useEffect(() => {
        if (initialLocation && initialLocation.trim().length >= 2 && !hasAutoSelectedRef.current) {
            hasAutoSelectedRef.current = true;
            const fetchAndSelectFirst = async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(initialLocation)}&format=json&addressdetails=1&limit=1&countrycodes=us`
                    );
                    const data = await response.json();
                    if (data.length > 0) {
                        const item = data[0];
                        const city = item.address?.city || item.address?.town || item.address?.village || item.name || '';
                        const state = item.address?.state || '';
                        const displayName = city && state ? `${city}, ${state}` : item.display_name.split(',').slice(0, 2).join(',');
                        setLocationInput(displayName);
                    }
                } catch (error) {
                    console.error("Error auto-selecting location:", error);
                }
            };
            fetchAndSelectFirst();
        }
    }, [initialLocation]);

    // Debounced location autocomplete using OpenStreetMap Nominatim
    const handleLocationInputChange = (value: string) => {
        setLocationInput(value);
        setShowSuggestions(true);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.trim().length < 2) {
            setLocationSuggestions([]);
            return;
        }

        // Debounce API calls (300ms)
        debounceRef.current = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=us`
                );
                const data = await response.json();
                const suggestions = data.map((item: any) => {
                    // Format as "City, State" when possible
                    const city = item.address?.city || item.address?.town || item.address?.village || item.name || '';
                    const state = item.address?.state || '';
                    const displayName = city && state ? `${city}, ${state}` : item.display_name.split(',').slice(0, 2).join(',');
                    return {
                        display_name: displayName,
                        place_id: item.place_id
                    };
                });
                setLocationSuggestions(suggestions);
            } catch (error) {
                console.error("Error fetching location suggestions:", error);
                setLocationSuggestions([]);
            }
            setIsLoadingSuggestions(false);
        }, 300);
    };

    const handleSelectSuggestion = (suggestion: { display_name: string }) => {
        setLocationInput(suggestion.display_name);
        setShowSuggestions(false);
        setLocationSuggestions([]);
    };

    const handleAddEntry = () => {
        setPhoneEntries(prev => [...prev, { name: '', phoneNumber: '' }]);
    };

    const handleRemoveEntry = (index: number) => {
        setPhoneEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleEntryChange = (index: number, field: 'name' | 'phoneNumber', value: string) => {
        setPhoneEntries(prev => prev.map((entry, i) => 
            i === index ? { ...entry, [field]: value } : entry
        ));
    };

    const validEntries = phoneEntries.filter(entry => entry.phoneNumber.trim() !== '');
    const isValid = validEntries.length > 0;

    const handleSubmit = () => {
        setIsSubmitted(true);
        onSubmit(validEntries.map(entry => ({
            name: entry.name.trim() || undefined,
            phoneNumber: entry.phoneNumber.trim()
        })));
    };

    const handleUseCurrentLocation = () => {
        setIsGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Reverse geocode using OpenStreetMap Nominatim (free, no API key needed)
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                        );
                        const data = await response.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
                        const state = data.address?.state || '';
                        if (city && state) {
                            setLocationInput(`${city}, ${state}`);
                        } else if (city || state) {
                            setLocationInput(city || state);
                        } else {
                            // Fallback to coordinates if geocoding fails
                            setLocationInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        }
                    } catch (error) {
                        console.error("Error reverse geocoding:", error);
                        setLocationInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                    setIsGettingLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsGettingLocation(false);
                    alert("Could not get your location. Please enter it manually.");
                }
            );
        } else {
            setIsGettingLocation(false);
            alert("Geolocation is not supported by your browser. Please enter location manually.");
        }
    };

    const handleSearchBusinesses = async () => {
        if (!locationInput.trim()) return;
        
        setIsSearching(true);
        // TODO: Implement actual business search API (Google Places, Yelp, etc.)
        // For now, simulate a search delay
        setTimeout(() => {
            setIsSearching(false);
            setShowLocationPicker(false);
            // TODO: Replace with actual results - for now just show a message
            alert(`Business search for "${serviceName || 'businesses'}" near "${locationInput}" coming soon! For now, please enter phone numbers manually.`);
        }, 1000);
    };

    if (isSubmitted) return null;

    return (
        <div className="mt-8 space-y-6 border-t border-zinc-100 dark:border-zinc-800 pt-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase rounded tracking-wider">
                    Final Step
                </div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {allowMultiple ? "Add Phone Numbers to Call" : "Enter Phone Number"}
                </h4>
            </div>

            {/* Find Businesses Button - only show for call_businesses */}
            {allowMultiple && !showLocationPicker && (
                <button
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <Search className="w-4 h-4" />
                    Find Businesses Automatically
                </button>
            )}

            {/* Location Picker */}
            <AnimatePresence>
                {showLocationPicker && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Where should we search?
                            </h5>
                            <button
                                onClick={() => setShowLocationPicker(false)}
                                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={isGettingLocation}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {isGettingLocation ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Navigation className="w-4 h-4" />
                                )}
                                Use Current Location
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                            <span>or</span>
                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => handleLocationInputChange(e.target.value)}
                                    onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Enter city, zip code, or address..."
                                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                                />
                                {/* Autocomplete suggestions dropdown */}
                                {showSuggestions && (locationSuggestions.length > 0 || isLoadingSuggestions) && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 overflow-hidden">
                                        {isLoadingSuggestions ? (
                                            <div className="px-3 py-2 text-sm text-zinc-400 flex items-center gap-2">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Searching...
                                            </div>
                                        ) : (
                                            locationSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={suggestion.place_id || index}
                                                    onClick={() => handleSelectSuggestion(suggestion)}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                                                >
                                                    <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                                                    <span className="truncate">{suggestion.display_name}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSearchBusinesses}
                                disabled={!locationInput.trim() || isSearching}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSearching ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                Search
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Divider when location picker is shown */}
            {allowMultiple && !showLocationPicker && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                    <span>or enter manually</span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                </div>
            )}

            <div className="space-y-3">
                {phoneEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        {allowMultiple && (
                            <input
                                type="text"
                                value={entry.name}
                                onChange={(e) => handleEntryChange(index, 'name', e.target.value)}
                                placeholder="Business name (optional)"
                                className="w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                            />
                        )}
                        <input
                            type="tel"
                            value={entry.phoneNumber}
                            onChange={(e) => handleEntryChange(index, 'phoneNumber', e.target.value)}
                            placeholder={allowMultiple ? `Phone number ${index + 1}` : "Enter phone number"}
                            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                        />
                        {allowMultiple && phoneEntries.length > 1 && (
                            <button
                                onClick={() => handleRemoveEntry(index)}
                                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {allowMultiple && (
                <button
                    onClick={handleAddEntry}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add another number
                </button>
            )}

            <p className="text-xs text-zinc-400 italic">
                {allowMultiple 
                    ? "Add the phone numbers of businesses you'd like us to call. We'll contact each one to gather the information you need."
                    : "Enter the phone number you'd like us to call."
                }
            </p>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-zinc-200 dark:shadow-none"
                >
                    {allowMultiple ? `Start Calling ${validEntries.length} Number${validEntries.length !== 1 ? 's' : ''}` : "Continue"}
                </button>
            </div>
        </div>
    );
}

interface CallState {
    status: "idle" | "calling" | "in-progress" | "completed" | "failed";
    callId?: string;
    error?: string;
    result?: {
        transcript?: string;
        recordingUrl?: string;
        analysis?: any;
        endedReason?: string;
        cost?: number;
    };
}

function CallResultsDisplay({ callState }: { callState: CallState }) {
    if (callState.status === "idle") return null;

    return (
        <div className="mt-6 space-y-4">
            {/* Status indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                {callState.status === "calling" && (
                    <>
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Initiating call...</span>
                    </>
                )}
                {callState.status === "in-progress" && (
                    <>
                        <Phone className="w-5 h-5 text-green-500 animate-pulse" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Call in progress...</span>
                    </>
                )}
                {callState.status === "completed" && (
                    <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Call completed</span>
                    </>
                )}
                {callState.status === "failed" && (
                    <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">{callState.error || "Call failed"}</span>
                    </>
                )}
            </div>

            {/* Results */}
            {callState.status === "completed" && callState.result && (
                <div className="space-y-4">
                    {/* Recording */}
                    {callState.result.recordingUrl && (
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recording</span>
                            </div>
                            <audio controls className="w-full" src={callState.result.recordingUrl}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}

                    {/* Transcript */}
                    {callState.result.transcript && (
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Transcript</span>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                                {callState.result.transcript}
                            </p>
                        </div>
                    )}

                    {/* Call info */}
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                        {callState.result.endedReason && (
                            <span>Ended: {callState.result.endedReason}</span>
                        )}
                        {callState.result.cost !== undefined && (
                            <span>Cost: ${callState.result.cost.toFixed(4)}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function TaskSummary({ analysis, showCallButton = true }: { analysis: AnalysisResult; showCallButton?: boolean }) {
    const { extractedInfo, callObjective } = analysis;
    const { questionsToAsk = [], phoneNumbers = [] } = extractedInfo;
    const [callState, setCallState] = useState<CallState>({ status: "idle" });

    const pollCallStatus = useCallback(async (callId: string) => {
        const maxAttempts = 60; // 5 minutes max (5s intervals)
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(`/api/vapi?callId=${callId}`);
                const data = await response.json();

                if (data.error) {
                    setCallState({ status: "failed", error: data.error });
                    return;
                }

                if (data.status === "ended") {
                    setCallState({
                        status: "completed",
                        callId,
                        result: {
                            transcript: data.transcript,
                            recordingUrl: data.recordingUrl,
                            analysis: data.analysis,
                            endedReason: data.endedReason,
                            cost: data.cost,
                        },
                    });
                    return;
                }

                if (data.status === "in-progress" || data.status === "ringing") {
                    setCallState({ status: "in-progress", callId });
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000);
                } else {
                    setCallState({ status: "failed", error: "Call timed out" });
                }
            } catch (error) {
                setCallState({ status: "failed", error: "Failed to check call status" });
            }
        };

        poll();
    }, []);

    const initiateCall = async () => {
        if (!phoneNumbers || phoneNumbers.length === 0) {
            setCallState({ status: "failed", error: "No phone numbers provided" });
            return;
        }

        setCallState({ status: "calling" });

        try {
            // For now, call the first number. TODO: Support multiple calls
            const response = await fetch("/api/vapi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phoneNumber: phoneNumbers[0].phoneNumber,
                    callObjective: callObjective || "Gather information",
                    serviceName: extractedInfo.service || "service",
                    serviceDetails: extractedInfo.serviceDetails,
                    questionsToAsk: questionsToAsk,
                    budget: extractedInfo.budget,
                    timeConstraint: extractedInfo.timeConstraints,
                    userName: extractedInfo.userName,
                    callbackNumber: extractedInfo.callbackNumber,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to initiate call");
            }

            setCallState({ status: "in-progress", callId: data.call.id });
            pollCallStatus(data.call.id);
        } catch (error) {
            setCallState({
                status: "failed",
                error: error instanceof Error ? error.message : "Failed to initiate call",
            });
        }
    };

    // Separate standard keys to ensure a logical order at the top
    const orderedKeys = ['service', 'serviceDetails', 'location', 'budget', 'timeConstraints', 'preferredCriteria', 'phoneNumbers', 'additionalNotes'];

    // Get all other flexible keys
    const extraInfoKeys = Object.keys(extractedInfo).filter(
        key => !orderedKeys.includes(key) && key !== 'questionsToAsk' && extractedInfo[key]
    );

    return (
        <div className="space-y-8 py-2">
            {/* Header Section */}
            <div className="space-y-3">
                <div className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    Task Summary
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                    {callObjective}
                </h3>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-y border-zinc-100 dark:border-zinc-800/50 py-10">
                <SummaryItem label="Service" value={extractedInfo.service} />
                <SummaryItem label="Details" value={extractedInfo.serviceDetails} />
                <SummaryItem label="Location" value={extractedInfo.location} />
                <SummaryItem label="Budget" value={extractedInfo.budget} />
                <SummaryItem label="Timeline" value={extractedInfo.timeConstraints} />
                <SummaryItem label="Priority" value={extractedInfo.preferredCriteria} />
                <SummaryItem label="Phone Numbers" value={phoneNumbers.length > 0 ? phoneNumbers.map(p => p.name ? `${p.name}: ${p.phoneNumber}` : p.phoneNumber).join(", ") : null} />
                <SummaryItem label="Additional Notes" value={extractedInfo.additionalNotes} />

                {/* Dynamically render any extra info detected by AI */}
                {extraInfoKeys.map(key => (
                    <SummaryItem
                        key={key}
                        label={key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                        value={extractedInfo[key]}
                    />
                ))}
            </div>

            {/* Questions to Ask */}
            <div className="space-y-6">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Key Inquiry Points</h4>
                <div className="grid grid-cols-1 gap-4">
                    {questionsToAsk.map((q: string, i: number) => (
                        <div key={i} className="flex gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                            <span className="text-zinc-300 dark:text-zinc-700 font-mono text-xs mt-0.5">0{i + 1}</span>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{q}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Action - only show if showCallButton is true */}
            {showCallButton && (
                <div className="pt-4 space-y-8">
                    <button
                        onClick={initiateCall}
                        disabled={callState.status === "calling" || callState.status === "in-progress"}
                        className="group relative w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl text-sm font-semibold hover:bg-black dark:hover:bg-white transition-all overflow-hidden shadow-2xl shadow-zinc-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {callState.status === "calling" && <Loader2 className="w-4 h-4 animate-spin" />}
                            {callState.status === "in-progress" && <Phone className="w-4 h-4 animate-pulse" />}
                            {callState.status === "idle" && <Phone className="w-4 h-4" />}
                            {callState.status === "completed" && <CheckCircle className="w-4 h-4" />}
                            {callState.status === "failed" && <XCircle className="w-4 h-4" />}
                            {callState.status === "idle" && `Initiate Call${phoneNumbers.length > 1 ? ` (${phoneNumbers.length} numbers)` : ''}`}
                            {callState.status === "calling" && "Initiating..."}
                            {callState.status === "in-progress" && "Call In Progress..."}
                            {callState.status === "completed" && "Call Completed"}
                            {callState.status === "failed" && "Retry Call"}
                        </span>
                    </button>

                    <CallResultsDisplay callState={callState} />

                    {callState.status === "idle" && (
                        <div className="flex flex-col items-center text-center space-y-2">
                            <p className="text-sm text-zinc-600 dark:text-zinc-200 font-medium tracking-tight">
                                Everything look correct?
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[80%] leading-relaxed">
                                If you have more instructions or want to change anything, just type it below—I'm ready when you are.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

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

    const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
        e?.preventDefault();
        const content = overrideInput || input.trim();
        if (!content || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content,
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            const data = await response.json();
            console.log("Analysis Result:", data.analysis);

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong. Please try again using different prompt.");
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
            className="relative flex-1 h-screen w-full flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300 overflow-hidden"
        >
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto w-full scroll-smooth z-10"
            >
                <AnimatePresence>
                    {showEmptyState && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-x-0 h-full flex flex-col items-center justify-center p-8 z-0 pointer-events-none"
                        >
                            <motion.div
                                animate={{
                                    paddingLeft: leftOpen ? "280px" : "72px",
                                    paddingRight: rightOpen ? "320px" : "0px",
                                }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="flex flex-col items-center justify-center w-full px-4"
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

                                <div className="h-20 relative w-full mb-4 overflow-hidden flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={exampleIndex}
                                            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute w-full max-w-4xl text-center text-lg md:text-xl text-zinc-400 dark:text-zinc-600 font-light tracking-wide px-4"
                                        >
                                            {EXAMPLES[exampleIndex]}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    animate={{
                        paddingLeft: leftOpen ? "280px" : "72px",
                        paddingRight: rightOpen ? "320px" : "0px",
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full flex flex-col"
                >
                    <div className="flex-1 w-full max-w-4xl mx-auto min-h-[calc(100vh-200px)] flex flex-col p-4 md:p-8 space-y-6 relative">
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
                                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                                            {/* Conversation response - just show the reply */}
                                            {typeof msg.content !== "string" && msg.content.responseType === "conversation" ? (
                                                <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
                                                    {msg.content.reply}
                                                </div>
                                            ) : typeof msg.content !== "string" && !msg.content.hasAllRequiredInfo ? (
                                                /* If incomplete, show technical analysis and forms */
                                                <>
                                                    <h3 className="text-sm uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6 font-medium flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                        Required Information
                                                    </h3>

                                                    <AnalysisFormGroup
                                                        missingInfo={msg.content.missingInfo}
                                                        onSubmit={(answers) => handleSubmit(undefined, answers)}
                                                    />
                                                </>
                                            ) : typeof msg.content !== "string" && msg.content.hasAllRequiredInfo && (!msg.content.extractedInfo.phoneNumbers || msg.content.extractedInfo.phoneNumbers.length === 0) ? (
                                                /* All info gathered, now collect phone numbers */
                                                <>
                                                    <TaskSummary analysis={msg.content} showCallButton={false} />
                                                    <PhoneNumberCollector
                                                        allowMultiple={msg.content.callType === "call_businesses"}
                                                        serviceName={msg.content.extractedInfo.service}
                                                        initialLocation={msg.content.extractedInfo.location}
                                                        onSubmit={(phoneNumbers) => {
                                                            const phoneList = phoneNumbers.map(p => p.name ? `${p.name}: ${p.phoneNumber}` : p.phoneNumber).join(", ");
                                                            handleSubmit(undefined, `Here are the phone numbers to call: ${phoneList}`);
                                                        }}
                                                    />
                                                </>
                                            ) : typeof msg.content !== "string" && msg.content.hasAllRequiredInfo ? (
                                                /* If complete with phone numbers, show the premium summary with call button */
                                                <TaskSummary analysis={msg.content} showCallButton={true} />
                                            ) : (
                                                /* Fallback for strings / errors */
                                                <div className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                                    {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-lg md:text-xl font-light tracking-tight px-2">
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
                        <div ref={messagesEndRef} className="h-20" />
                    </div>
                </motion.div>
            </div>

            <motion.div
                animate={{
                    paddingLeft: leftOpen ? "280px" : "72px",
                    paddingRight: rightOpen ? "320px" : "0px",
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full p-4 md:p-6 z-20 pb-8 pt-4 bg-gradient-to-t from-zinc-50 dark:from-black via-zinc-50 dark:via-black to-transparent"
            >
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
            </motion.div>
        </motion.main>
    );
}
