"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Settings, Palette, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const sections = [
        { id: "account", name: "Account", icon: User },
        { id: "appearance", name: "Appearance", icon: Palette },
        { id: "notifications", name: "Notifications", icon: Bell },
        { id: "privacy", name: "Privacy & Security", icon: Shield },
    ];

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-surface-900 mb-2 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-brand-500" />
                    Settings
                </h1>
                <p className="text-surface-900/50">Manage your "US" experience and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-1">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${s.id === "appearance"
                                    ? "bg-brand-500/10 text-brand-500"
                                    : "text-surface-900/50 hover:bg-surface-100 hover:text-surface-900"
                                }`}
                        >
                            <s.icon className="w-4 h-4" />
                            {s.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-8">

                    {/* Appearance Section */}
                    <div className="glass-panel p-8 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-surface-900 mb-1">Appearance</h2>
                            <p className="text-sm text-surface-900/50">Customize how the platform looks for you.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-surface-900/60 uppercase tracking-wider">Interface Theme</label>

                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "light"
                                            ? "border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10"
                                            : "border-surface-100 bg-surface-50 hover:border-surface-100"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center text-orange-500 border border-slate-100">
                                        <Sun className="w-6 h-6" />
                                    </div>
                                    <span className={`text-sm font-bold ${theme === "light" ? "text-brand-500" : "text-surface-900/50"}`}>Light</span>
                                </button>

                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "dark"
                                            ? "border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10"
                                            : "border-surface-100 bg-surface-50 hover:border-surface-100"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-900 shadow-inner flex items-center justify-center text-brand-500">
                                        <Moon className="w-6 h-6" />
                                    </div>
                                    <span className={`text-sm font-bold ${theme === "dark" ? "text-brand-500" : "text-surface-900/50"}`}>Dark</span>
                                </button>

                                <button
                                    onClick={() => setTheme("system")}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "system"
                                            ? "border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10"
                                            : "border-surface-100 bg-surface-50 hover:border-surface-100"
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-800 shadow-inner flex items-center justify-center text-surface-900">
                                        <Monitor className="w-6 h-6" />
                                    </div>
                                    <span className={`text-sm font-bold ${theme === "system" ? "text-brand-500" : "text-surface-900/50"}`}>System</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-surface-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-surface-900">Color Blindness Mode</h4>
                                <p className="text-xs text-surface-900/50">Adjust palette for better visibility.</p>
                            </div>
                            <div className="w-12 h-6 bg-surface-100 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for other sections */}
                    <div className="glass-panel p-8 opacity-50 pointer-events-none">
                        <h2 className="text-xl font-bold text-surface-900 mb-4 italic">Account Settings (Coming Soon)</h2>
                        <div className="h-4 w-full bg-surface-100 rounded animate-pulse mb-3"></div>
                        <div className="h-4 w-2/3 bg-surface-100 rounded animate-pulse"></div>
                    </div>

                </div>
            </div>
        </div>
    );
}
