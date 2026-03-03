"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Home,
    Users,
    Briefcase,
    Newspaper,
    GraduationCap,
    HeartPulse,
    Settings,
    ShieldAlert,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "All Communities", href: "/communities", icon: Users },
    { name: "Jobs & Careers", href: "/c/jobs", icon: Briefcase },
    { name: "Daily News", href: "/c/news", icon: Newspaper },
    { name: "Education Hub", href: "/c/education", icon: GraduationCap },
    { name: "Daily Notes", href: "/notes", icon: BookOpen },
    { name: "Emergencies", href: "/c/emergencies", icon: HeartPulse },
    { name: "Govt Schemes", href: "/c/schemes", icon: ShieldAlert },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [metrics, setMetrics] = useState({ communitiesCount: 0, totalScore: 0 });

    useEffect(() => {
        const fetchMetrics = async () => {
            if (session?.user) {
                try {
                    const res = await fetch('/api/users/metrics');
                    if (res.ok) {
                        const data = await res.json();
                        setMetrics(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch metrics:', error);
                }
            }
        };

        fetchMetrics();
    }, [session]);

    // Hide sidebar on auth pages
    if (pathname === '/login' || pathname === '/register') return null;

    const user = session?.user as any;
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
    const profileLink = user?.username ? `/u/${user.username.replace('@', '')}` : '/';

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-surface-100 bg-surface-50 h-full overflow-y-auto">
            {/* User Profile Summary */}
            <div className="p-6 pb-4 border-b border-surface-100 flex flex-col items-center">
                <Link href={profileLink} className="flex flex-col items-center group">
                    <div className="w-16 h-16 rounded-full bg-surface-800 border-2 border-surface-100 group-hover:border-brand-500 transition-colors flex items-center justify-center text-surface-900 font-black text-2xl shadow-sm mb-3 overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt={user?.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </div>
                    <h2 className="text-sm font-bold text-surface-900 group-hover:text-brand-500 transition-colors">
                        {user?.name || "Guest User"}
                    </h2>
                    <p className="text-xs text-brand-500 font-medium mb-4">{user?.username || "@guest"}</p>
                </Link>

                <div className="flex w-full justify-between px-2 text-center">
                    <div>
                        <p className="font-bold text-surface-900 text-sm">{metrics.communitiesCount}</p>
                        <p className="text-[10px] text-surface-900/50 uppercase tracking-wider">Communities</p>
                    </div>
                    <div>
                        <p className="font-bold text-surface-900 text-sm">{metrics.totalScore}</p>
                        <p className="text-[10px] text-surface-900/50 uppercase tracking-wider">Total Score</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group",
                                isActive
                                    ? "bg-brand-500 text-black shadow-sm"
                                    : "text-surface-900/50 hover:bg-surface-100 hover:text-surface-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-black" : "text-surface-900/50 group-hover:text-surface-900/80"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-surface-100">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
                >
                    <ShieldAlert className="w-5 h-5" />
                    Warning Status
                </Link>
            </div>
        </aside>
    );
}
