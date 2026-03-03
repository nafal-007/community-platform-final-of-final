"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Users,
    Search,
    User,
    Settings,
    PlusCircle,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const mobileNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/communities", icon: Users },
    { name: "Notes", href: "/notes", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Hide on auth pages
    if (pathname === '/login' || pathname === '/register') return null;

    const user = session?.user as any;
    const profileLink = user?.username ? `/u/${user.username.replace('@', '')}` : '/';

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-50/80 backdrop-blur-lg border-t border-surface-100 px-4 h-16 safe-area-pb">
            <div className="flex items-center justify-around h-full max-w-md mx-auto">
                {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200",
                                isActive ? "text-brand-500" : "text-surface-900/50 hover:text-surface-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-6 h-6",
                                isActive ? "fill-brand-500/10 shadow-glow" : ""
                            )} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                        </Link>
                    );
                })}

                {/* Profile Link */}
                <Link
                    href={profileLink}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200",
                        pathname.startsWith('/u/') ? "text-brand-500" : "text-surface-900/50 hover:text-surface-900"
                    )}
                >
                    {user?.image ? (
                        <img src={user.image} alt="Profile" className={cn(
                            "w-6 h-6 rounded-full object-cover border",
                            pathname.startsWith('/u/') ? "border-brand-500" : "border-surface-100"
                        )} />
                    ) : (
                        <User className="w-6 h-6" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                </Link>
            </div>
        </nav>
    );
}
