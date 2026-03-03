import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Users, Info, ShieldCheck, Lock, CheckCircle, Clock, Settings } from "lucide-react";
import CreatePostForm from "@/components/post/CreatePostForm";
import Link from "next/link";
import PostCard from "@/components/post/PostCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import JoinCommunityButton from "@/components/community/JoinCommunityButton";
import LeaveCommunityButton from "@/components/community/LeaveCommunityButton";
import CommunityMemberList from "@/components/community/CommunityMemberList";

export const dynamic = "force-dynamic";

export default async function CommunityPage({ params }: { params: Promise<{ name: string }> }) {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;
    const decodedName = decodeURIComponent(resolvedParams.name);

    // Build the query options dynamically to avoid Prisma v5 'false' include type errors
    // We construct the base include object that doesn't depend on session
    const baseInclude = {
        _count: {
            select: { members: true }
        },
        posts: {
            include: {
                author: {
                    select: { name: true, image: true, role: true }
                },
                comments: {
                    include: {
                        author: {
                            select: { name: true, image: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' } as const
                },
                _count: {
                    select: { comments: true, likes: true }
                },
                ...(session?.user?.id ? {
                    likes: {
                        where: { userId: session.user.id }
                    }
                } : {})
            },
            orderBy: {
                createdAt: 'desc'
            } as const
        },
        ...(session?.user?.id ? {
            members: {
                where: { userId: session.user.id }
            },
            joinRequests: {
                where: { userId: session.user.id }
            }
        } : {})
    };

    // Fetch the community
    const community = await prisma.community.findFirst({
        where: {
            name: {
                equals: decodedName,
            }
        },
        include: baseInclude
    });

    if (!community) {
        return notFound();
    }

    const membersList = await prisma.communityMember.findMany({
        where: { communityId: community.id },
        include: { user: { select: { id: true, name: true, username: true, image: true } } },
        orderBy: [{ role: 'asc' }]
    });

    const isMember = session ? community.members.length > 0 : false;
    const isPlatformAdmin = session?.user?.role === "ADMIN";
    const isCommunityAdmin = isMember ? community.members[0].role === "ADMIN" : false;
    const isAdmin = isPlatformAdmin || isCommunityAdmin;
    const hasAccess = !community.isPrivate || isMember || isAdmin;
    const existingRequest = community.joinRequests?.[0]?.status || null;

    return (
        <div className="max-w-5xl mx-auto w-full pt-6 pb-20 grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Main Feed Column */}
            <div className="lg:col-span-3 space-y-6">

                {/* Community Header Mobile (Hidden on Desktop) */}
                <div className="lg:hidden glass-panel p-6 mb-6 border-l-4 border-l-brand-500 rounded-none overflow-hidden">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-surface-100 rounded-2xl overflow-hidden flex items-center justify-center text-brand-500 font-black text-2xl shadow-inner border border-surface-200/50">
                            {community.avatarUrl ? (
                                <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                            ) : (
                                community.name[0].toUpperCase()
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-surface-900 flex items-center gap-2">
                                c/{community.name}
                                {community.isPrivate && <Lock className="w-4 h-4 text-brand-500" />}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-surface-900/60 uppercase tracking-widest bg-surface-800 px-2 py-1 rounded-lg border border-surface-100/50">{community.category}</span>
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20">{community._count.members} Members</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-surface-900/70 text-sm leading-relaxed mb-6 px-1 italic">"{community.description}"</p>

                    {/* Mobile Action Buttons & Member Drawer */}
                    <div className="space-y-3 pt-4 border-t border-surface-100/30">
                        <div className="flex flex-wrap gap-2">
                            {session && (
                                isMember ? (
                                    <LeaveCommunityButton communityId={community.id} />
                                ) : (
                                    <JoinCommunityButton
                                        communityId={community.id}
                                        initialState={existingRequest ? (existingRequest === "PENDING" ? "PENDING" : "JOIN") : "JOIN"}
                                        isPrivate={community.isPrivate}
                                    />
                                )
                            )}

                            {isAdmin && (
                                <Link
                                    href={`/c/${encodeURIComponent(resolvedParams.name)}/settings`}
                                    className="flex-1 min-w-[120px] py-2.5 bg-brand-500 hover:bg-brand-600 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/10"
                                >
                                    <Settings className="w-3.5 h-3.5" /> Admin Tools
                                </Link>
                            )}
                        </div>

                        <details className="w-full group">
                            <summary className="flex items-center justify-between p-3.5 bg-surface-100/30 rounded-2xl cursor-pointer list-none hover:bg-surface-100/50 transition-all border border-surface-200/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-500/10 rounded-lg">
                                        <Users className="w-4 h-4 text-brand-500" />
                                    </div>
                                    <span className="text-sm font-bold text-surface-900">Member Directory</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-surface-900/40 uppercase">View All</span>
                                    <span className="text-xs text-surface-900/40 font-bold group-open:rotate-180 transition-transform duration-300">▼</span>
                                </div>
                            </summary>
                            <div className="mt-3 p-2 bg-surface-800/20 rounded-2xl border border-surface-100/20 backdrop-blur-sm">
                                <CommunityMemberList
                                    communityId={community.id}
                                    members={membersList as any}
                                    isAdmin={isAdmin}
                                    currentUserId={session?.user?.id}
                                />
                            </div>
                        </details>
                    </div>
                </div>

                {!hasAccess ? (
                    <div className="glass-panel p-16 flex flex-col items-center justify-center text-center border-dashed">
                        <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mb-6 border border-surface-200">
                            <Lock className="w-8 h-8 text-brand-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-surface-900 mb-3">This Community is Private</h2>
                        <p className="text-surface-900/60 max-w-md mb-8">
                            Only approved members can view posts, interact, and share updates in c/{community.name}.
                        </p>
                        <JoinCommunityButton
                            communityId={community.id}
                            initialState={existingRequest ? (existingRequest === "PENDING" ? "PENDING" : "JOIN") : "JOIN"}
                            isPrivate={true}
                        />
                    </div>
                ) : (
                    <>
                        {/* Create Post Area */}
                        {session ? (
                            isMember || isAdmin ? (
                                <CreatePostForm communityId={community.id} />
                            ) : (
                                <div className="glass-panel p-6 text-center border-dashed">
                                    <p className="text-surface-900/60 font-medium mb-3">You must join to post.</p>
                                    <JoinCommunityButton communityId={community.id} initialState="JOIN" isPrivate={false} />
                                </div>
                            )
                        ) : (
                            <div className="glass-panel p-6 text-center">
                                <p className="text-surface-900/60">Please log in to post in this community.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-8 mb-4">
                            <h3 className="font-bold text-lg text-surface-900">Community Feed</h3>
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {community.posts.length === 0 ? (
                                <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed">
                                    <Info className="w-12 h-12 text-surface-100 mb-4" />
                                    <h4 className="text-lg font-bold text-surface-900 mb-2">No posts yet</h4>
                                    <p className="text-surface-900/60 text-sm max-w-sm">
                                        Be the first to share something with c/{community.name}!
                                    </p>
                                </div>
                            ) : (
                                community.posts.map(post => (
                                    <PostCard key={post.id} post={post} />
                                ))
                            )}
                        </div>
                    </>
                )}

            </div>

            {/* Right Sidebar - Community Info */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
                <div className="glass-panel p-6 sticky top-24">
                    <div className="w-16 h-16 bg-brand-500 rounded-2xl overflow-hidden flex items-center justify-center text-black font-bold text-3xl mb-4 shadow-lg shadow-brand-500/20 relative">
                        {community.avatarUrl ? (
                            <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                        ) : (
                            community.name[0].toUpperCase()
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-surface-900 mb-1">c/{community.name}</h2>
                    <div className="inline-block px-2.5 py-1 bg-surface-100 text-brand-500 text-xs font-bold rounded-lg uppercase tracking-wide mb-4">
                        {community.category}
                    </div>

                    <p className="text-sm text-surface-900/60 mb-6 pb-6 border-b border-surface-100">
                        {community.description}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-surface-900/80">
                            <Users className="w-5 h-5 text-brand-500" />
                            <div>
                                <div className="font-bold text-surface-900">{community._count.members}</div>
                                <div className="text-xs text-surface-900/50">Members</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-surface-900/80">
                            {community.isPrivate ? (
                                <Lock className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <ShieldCheck className="w-5 h-5 text-brand-500" />
                            )}
                            <div>
                                <div className="font-bold text-surface-900">{community.isPrivate ? 'Private' : 'Public'}</div>
                                <div className="text-xs text-surface-900/50">Access Level</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {session ? (
                            isMember ? (
                                <LeaveCommunityButton communityId={community.id} />
                            ) : (
                                <JoinCommunityButton
                                    communityId={community.id}
                                    initialState={existingRequest ? (existingRequest === "PENDING" ? "PENDING" : "JOIN") : "JOIN"}
                                    isPrivate={community.isPrivate}
                                />
                            )
                        ) : null}

                        {isAdmin && (
                            <Link href={`/c/${encodeURIComponent(decodedName)}/settings`} className="w-full py-2.5 bg-surface-100 hover:bg-surface-200 text-brand-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <Settings className="w-4 h-4" /> Admin Settings
                            </Link>
                        )}
                    </div>

                    {/* Members List */}
                    <CommunityMemberList
                        communityId={community.id}
                        members={membersList as any}
                        isAdmin={isAdmin}
                        currentUserId={session?.user?.id}
                    />

                </div>
            </div>

        </div>
    );
}
