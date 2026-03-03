"use client";

import { useState } from "react";
import { Loader2, LogOut, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeaveButtonProps {
    communityId: string;
}

export default function LeaveCommunityButton({ communityId }: LeaveButtonProps) {
    const [status, setStatus] = useState<"JOINED" | "LOADING" | "HOVER">("JOINED");
    const router = useRouter();

    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave this community?")) return;

        setStatus("LOADING");
        try {
            const res = await fetch(`/api/communities/${communityId}/leave`, {
                method: "DELETE"
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to leave");
                setStatus("JOINED");
            }
        } catch (error) {
            console.error(error);
            setStatus("JOINED");
        }
    };

    if (status === "LOADING") {
        return (
            <button disabled className="w-full py-2.5 bg-surface-50 border border-surface-100 text-surface-900/60 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                <Loader2 className="w-5 h-5 animate-spin" /> Leaving...
            </button>
        );
    }

    return (
        <button
            onClick={handleLeave}
            onMouseEnter={() => setStatus("HOVER")}
            onMouseLeave={() => setStatus("JOINED")}
            className={`w-full py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border ${status === "HOVER"
                    ? "bg-red-500/10 border-red-500 text-red-500"
                    : "bg-brand-500/10 border-brand-500 text-brand-500"
                }`}
        >
            {status === "HOVER" ? (
                <>
                    <LogOut className="w-4 h-4" /> Leave Community
                </>
            ) : (
                <>
                    <CheckCircle className="w-4 h-4" /> Joined
                </>
            )}
        </button>
    );
}
