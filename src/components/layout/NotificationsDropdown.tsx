"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    type: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string, link: string | null) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "PUT" });

            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (link) {
                setOpen(false);
                router.push(link);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full hover:bg-surface-100 flex items-center justify-center text-surface-900/60 hover:text-surface-900 transition-colors relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
                )}
            </button>

            {open && (
                <div className="absolute top-12 right-0 w-80 bg-surface-900 border border-surface-100 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all">
                    <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
                        <h3 className="font-bold text-surface-900">Notifications {unreadCount > 0 && <span className="text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full text-xs ml-2">{unreadCount} New</span>}</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 flex justify-center text-brand-500">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-surface-900/60 text-sm">
                                You have no new alerts.
                            </div>
                        ) : (
                            <ul className="divide-y divide-surface-100">
                                {notifications.map(notif => (
                                    <li
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id, notif.link)}
                                        className={`p-4 cursor-pointer hover:bg-surface-100 transition-colors flex gap-3 ${!notif.isRead ? 'bg-brand-500/5' : ''}`}
                                    >
                                        <div className="flex-1">
                                            <p className={`text-sm ${notif.isRead ? 'text-surface-900/80' : 'text-surface-900 font-bold'}`}>
                                                {notif.message}
                                            </p>
                                            <span className="text-xs text-surface-900/50 mt-1 block">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
