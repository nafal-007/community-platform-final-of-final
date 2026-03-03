"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Bell, Search, Home, MessageSquare, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import NotificationsDropdown from "./NotificationsDropdown";

export function Topbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    if (pathname === '/login' || pathname === '/register') return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            if (searchQuery.trim().startsWith("@")) {
                const cleanQuery = searchQuery.trim().replace("@", "");
                router.push(`/u/${cleanQuery}`);
            } else {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
            setSearchQuery("");
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-surface-50 border-b border-surface-100 h-16 flex-none">
            <div className="flex items-center justify-between h-full px-4 md:px-6 max-w-[1600px] mx-auto">

                {/* Left: Branding & Search */}
                <div className="flex items-center gap-8 w-1/3">
                    <Link href="/" className="flex items-center gap-2 transition-transform hover:opacity-90">
                        <Logo iconSize="w-8 h-8" textSize="text-3xl" />
                    </Link>

                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-900/60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find @username"
                            className="w-full pl-10 pr-4 py-2 bg-surface-100 border-none rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 text-surface-900 placeholder:text-surface-900/50 transition-all font-medium"
                        />
                    </form>
                </div>

                {/* Center: Main Navigation Icons (Desktop) / Search Toggle (Mobile) */}
                <div className="flex items-center justify-center gap-2 md:w-1/3">
                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/" className="p-3 text-brand-500 bg-brand-500/10 rounded-xl transition-all">
                            <Home className="w-5 h-5" />
                        </Link>
                        <Link href="/communities" className="p-3 text-surface-900/50 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all">
                            <MessageSquare className="w-5 h-5" />
                        </Link>
                        <Link href="/settings" className="p-3 text-surface-900/50 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all">
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Mobile Search Icon */}
                    <button
                        onClick={() => router.push('/search')}
                        className="md:hidden p-3 text-surface-900/60 hover:text-brand-500 hover:bg-surface-100 rounded-xl transition-all"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Right: Auth & Profile */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    {status === "loading" ? (
                        <div className="w-8 h-8 rounded-full bg-surface-100 animate-pulse"></div>
                    ) : session ? (
                        <div className="flex items-center gap-4">
                            <NotificationsDropdown />

                            <div className="flex items-center gap-3 pl-4 border-l border-surface-100">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-surface-50 shadow-sm" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-surface-100 flex items-center justify-center text-surface-900 font-bold shadow-sm border border-surface-100">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                )}
                                <div className="hidden md:block text-left mr-2">
                                    <p className="text-sm font-bold text-surface-900 leading-tight">{session.user?.name}</p>
                                    <p className="text-[11px] text-brand-500 font-medium tracking-wide">{(session.user as any)?.username || `@${session.user?.name?.replace(/\s+/g, '').toLowerCase()}`}</p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-surface-900/60 hover:text-red-400 hover:bg-surface-100 rounded-xl transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-surface-900/50 hover:text-surface-900 px-3 py-2 transition-colors">
                                Log in
                            </Link>
                            <Link href="/register" className="text-sm font-bold bg-brand-500 hover:bg-brand-600 text-black px-5 py-2 rounded-xl transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
