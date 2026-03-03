"use client";

import { useState } from "react";
import { ShieldCheck, UserMinus, Loader2, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Member {
    id: string; // The membership record ID
    role: string;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    };
}

interface CommunityMemberListProps {
    communityId: string;
    members: Member[];
    isAdmin: boolean;
    currentUserId?: string;
}

export default function CommunityMemberList({ communityId, members, isAdmin, currentUserId }: CommunityMemberListProps) {
    const router = useRouter();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (memberUserId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the community?`)) {
            return;
        }

        setRemovingId(memberUserId);
        try {
            const res = await fetch(`/api/communities/${communityId}/members/${memberUserId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to remove member");
            }

            toast.success("Member removed successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wide">Members ({members.length})</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {members.map((member) => {
                    const isSelf = member.user.id === currentUserId;
                    const isMemberAdmin = member.role === "ADMIN";

                    return (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-100 transition-colors group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                                    {member.user.image ? (
                                        <img src={member.user.image} alt={member.user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-4 h-4 text-surface-900/50" />
                                    )}
                                </div>
                                <div className="flex flex-col truncate">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold text-surface-900 truncate">
                                            {member.user.name} {isSelf && "(You)"}
                                        </span>
                                        {isMemberAdmin && (
                                            <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
                                                <ShieldCheck className="w-3 h-3" /> ADMIN
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-surface-900/60 truncate">@{member.user.username}</span>
                                </div>
                            </div>

                            {/* Remove action for Admins */}
                            {isAdmin && !isSelf && !isMemberAdmin && (
                                <button
                                    onClick={() => handleRemove(member.user.id, member.user.name || member.user.username || "User")}
                                    disabled={removingId === member.user.id}
                                    className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    title="Remove Member"
                                >
                                    {removingId === member.user.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <UserMinus className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
