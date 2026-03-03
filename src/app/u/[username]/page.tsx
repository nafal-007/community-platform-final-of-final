import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MapPin, Link as LinkIcon, Calendar, MessageSquare, Heart, Shield } from "lucide-react";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditProfileWrapper } from "@/components/profile/EditProfileWrapper";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = await params;
    // The username in the URL won't have the '@' prefix, so we add it back to match the DB
    const queryUsername = `@${resolvedParams.username.toLowerCase()}`;

    const user = await prisma.user.findUnique({
        where: { username: queryUsername },
        include: {
            posts: {
                orderBy: { createdAt: 'desc' },
                include: {
                    community: true,
                    _count: {
                        select: { comments: true, likes: true }
                    }
                }
            },
            communities: {
                include: {
                    community: true
                }
            },
            _count: {
                select: { posts: true, communities: true }
            }
        }
    });

    if (!user) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const isOwner = (session?.user as any)?.username === user.username;

    return (
        <div className="w-full h-full p-6 text-surface-900 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Profile Header */}
                <div className="glass-panel p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-900 via-surface-900 to-brand-900 opacity-50 z-0 border-b border-surface-100"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-end mt-12">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-surface-50 bg-surface-800 flex items-center justify-center text-4xl font-black shadow-xl overflow-hidden shrink-0">
                            {user.image ? (
                                <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 pb-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold">{user.name}</h1>
                                        {user.role === 'ADMIN' && (
                                            <span className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-brand-500 font-medium text-lg mb-4">{user.username}</p>
                                </div>

                                {isOwner && (
                                    <EditProfileWrapper currentBio={user.bio} currentImage={user.image} currentName={user.name} currentUsername={user.username!} />
                                )}
                            </div>

                            <p className="text-surface-900/80 max-w-2xl leading-relaxed">
                                {user.bio || "This user hasn't added a bio yet."}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-4 mt-8 pt-6 border-t border-surface-100 text-sm text-surface-900/60">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                        </div>
                    </div>
                </div>

                {/* Content Split */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column: Stats & Communities */}
                    <div className="w-full md:w-80 space-y-6 shrink-0">
                        <div className="glass-panel p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded bg-brand-500/10 flex items-center justify-center text-brand-500">
                                    <MessageSquare className="w-4 h-4" />
                                </span>
                                Contributions
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-surface-800 rounded-lg border border-surface-100">
                                    <span className="text-surface-900/60 font-medium">Posts</span>
                                    <span className="text-surface-900 font-bold">{user._count.posts}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-surface-800 rounded-lg border border-surface-100">
                                    <span className="text-surface-900/60 font-medium">Communities</span>
                                    <span className="text-surface-900 font-bold">{user._count.communities}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6">
                            <h3 className="font-bold text-lg mb-4">Joined Communities</h3>
                            {user.communities.length === 0 ? (
                                <p className="text-sm text-surface-900/60">Not a member of any communities yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {user.communities.map((c) => (
                                        <a href={`/c/${c.community.name}`} key={c.community.id} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-100 border border-surface-100 rounded-lg text-sm text-surface-900/80 transition-colors">
                                            {c.community.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: User's Posts Feed */}
                    <div className="flex-1 space-y-4">
                        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                        {user.posts.length === 0 ? (
                            <div className="glass-panel p-10 text-center">
                                <MessageSquare className="w-12 h-12 text-surface-100 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-surface-900 mb-2">No posts yet</h3>
                                <p className="text-surface-900/60 text-sm">When {user.name} posts in a community, it will appear here.</p>
                            </div>
                        ) : (
                            user.posts.map((post) => (
                                <div key={post.id} className="glass-panel p-5 transition-colors hover:border-surface-200">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-surface-900/50 mb-3">
                                        <span>Posted in</span>
                                        <a href={`/c/${post.community.name}`} className="text-brand-500 hover:underline">{post.community.name}</a>
                                        <span className="px-1.5">•</span>
                                        <span>{format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-surface-900 mb-2">{post.title}</h3>
                                    <p className="text-surface-900/80 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {post.content}
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 text-surface-900/80 text-xs font-bold">
                                            <Heart className="w-4 h-4 text-brand-500" />
                                            {post._count.likes}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-800 text-surface-900/80 text-xs font-bold">
                                            <MessageSquare className="w-4 h-4 text-brand-500" />
                                            {post._count.comments}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
