"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, User, Users, Check, X, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminRequestsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
            return;
        }

        if (status === "authenticated") {
            fetchRequests();
        }
    }, [status, session, router]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/requests/list"); // We will build this next
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/requests/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                // Remove from list optimistically
                setRequests(prev => prev.filter(req => req.id !== id));
            } else {
                alert("Failed to process request.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-surface-900 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-brand-500" />
                        Access Requests
                    </h1>
                    <p className="text-surface-900/60 mt-2">Manage pending user requests for private communities.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="p-2 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-xl transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed">
                        <Users className="w-12 h-12 text-surface-100 mb-4" />
                        <h4 className="text-lg font-bold text-surface-900 mb-2">Inbox Zero</h4>
                        <p className="text-surface-900/60 text-sm max-w-sm">
                            There are no pending community access requests at this time.
                        </p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-surface-100 hover:border-surface-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center border border-surface-200 overflow-hidden text-brand-500 font-bold">
                                    {req.user.image ? (
                                        <img src={req.user.image} alt={req.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        req.user.name?.[0] || 'U'
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-surface-900">{req.user.name}</span>
                                        <span className="text-xs text-surface-900/50">
                                            {req.user.username ? `@${req.user.username}` : req.user.email}
                                        </span>
                                    </div>
                                    <div className="text-sm text-surface-900/80 mt-1">
                                        Wants to join <strong className="text-brand-500">c/{req.community.name}</strong>
                                    </div>
                                    <div className="text-xs text-surface-900/50 mt-1 flex items-center gap-1">
                                        Requested {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAction(req.id, "REJECT")}
                                    disabled={actionLoading === req.id}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-100 hover:bg-red-500/20 text-surface-900/80 hover:text-red-500 rounded-xl font-bold transition-colors border border-transparent hover:border-red-500/50 disabled:opacity-50"
                                >
                                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Decline
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, "APPROVE")}
                                    disabled={actionLoading === req.id}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-black rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                                >
                                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
