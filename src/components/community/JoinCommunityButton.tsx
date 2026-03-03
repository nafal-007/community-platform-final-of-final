"use client";

import { useState } from "react";
import { Loader2, UserPlus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinButtonProps {
    communityId: string;
    initialState: "JOIN" | "PENDING";
    isPrivate: boolean;
}

export default function JoinCommunityButton({ communityId, initialState, isPrivate }: JoinButtonProps) {
    const [status, setStatus] = useState<"JOIN" | "PENDING" | "LOADING">(initialState);
    const router = useRouter();

    const handleJoin = async () => {
        if (status !== "JOIN") return;

        setStatus("LOADING");
        try {
            const res = await fetch(`/api/communities/${communityId}/join`, {
                method: "POST"
            });
            const data = await res.json();

            if (res.ok) {
                if (data.status === "PENDING") {
                    setStatus("PENDING");
                } else if (data.status === "ACCEPTED") {
                    // Refreshes entire page to unhide feed
                    router.refresh();
                }
            } else {
                setStatus("JOIN");
                alert(data.message || "Failed to join");
            }
        } catch (error) {
            console.error(error);
            setStatus("JOIN");
        }
    };

    if (status === "PENDING") {
        return (
            <button disabled className="w-full py-2.5 bg-surface-50 border border-surface-100 text-surface-900/60 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-not-allowed">
                <Clock className="w-4 h-4" /> Request Pending
            </button>
        );
    }

    return (
        <button
            onClick={handleJoin}
            disabled={status === "LOADING"}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
            {status === "LOADING" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <UserPlus className="w-4 h-4" /> {isPrivate ? "Request to Join" : "Join Community"}
                </>
            )}
        </button>
    );
}
