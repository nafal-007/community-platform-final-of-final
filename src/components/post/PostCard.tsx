"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, ShieldCheck, Clock, Send, Loader2, Share2, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PostCard({ post }: { post: any }) {
    const { data: session } = useSession();
    const router = useRouter();

    // Derived initial states from server props
    const initialLiked = post.likes && post.likes.length > 0;
    const initialLikeCount = post._count?.likes || 0;
    const initialCommentCount = post._count?.comments || 0;

    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [likeLoading, setLikeLoading] = useState(false);

    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);

    const [copied, setCopied] = useState(false);

    // Optimistic comments
    const [comments, setComments] = useState(post.comments || []);
    const [commentCount, setCommentCount] = useState(initialCommentCount);

    const handleLike = async () => {
        if (!session) return router.push("/login");
        if (likeLoading) return;

        setLikeLoading(true);
        // Optimistic update
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
            if (!res.ok) {
                // Revert if failed
                setLiked(liked);
                setLikeCount(liked ? likeCount : likeCount - 1);
            }
        } catch (error) {
            setLiked(liked);
            setLikeCount(liked ? likeCount : likeCount - 1);
        } finally {
            setLikeLoading(false);
            router.refresh();
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return router.push("/login");
        if (!commentContent.trim() || commentLoading) return;

        setCommentLoading(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: commentContent })
            });

            if (res.ok) {
                const data = await res.json();
                setComments([...comments, data.comment]);
                setCommentCount(commentCount + 1);
                setCommentContent("");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleShare = () => {
        // Fallback to post.communityId if community isn't populated
        const communityName = post.community?.name || post.communityId;
        const url = `${window.location.origin}/c/${communityName}/p/${post.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const isAuthor = session?.user?.id === post.authorId;
    const isGlobalAdmin = session?.user?.role === "ADMIN";
    const canDelete = isAuthor || isGlobalAdmin;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
            if (res.ok) {
                setIsDeleted(true);
                router.refresh();
            } else {
                alert("Failed to delete post.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (isDeleted) return null; // Optimistic hide

    return (
        <article className="glass-panel p-5 border border-surface-100 hover:border-surface-200 transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center font-bold text-surface-900 border border-surface-200 overflow-hidden">
                        {post.author?.image ? (
                            <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                            post.author?.name?.[0] || 'U'
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-surface-900 text-sm">{post.author?.name || "Anonymous"}</span>
                            {post.author?.role === 'ADMIN' && (
                                <ShieldCheck className="w-4 h-4 text-brand-500" />
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-surface-900/50">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {post.validityScore > 0 && (
                        <div className="px-2.5 py-1 bg-brand-500/10 text-brand-500 rounded-md text-xs font-bold border border-brand-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> +{post.validityScore} Validity
                        </div>
                    )}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            title="Delete Post"
                            className="p-1.5 text-surface-900/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                        >
                            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            <div className="md:pl-13"> {/* Indent only on desktop to align with text */}
                <h4 className="text-base md:text-lg font-bold text-surface-900 mb-2 leading-snug">{post.title}</h4>
                <p className="text-xs md:text-sm text-surface-900/80 mb-4 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </p>

                {post.mediaUrl && post.mediaType === "IMAGE" && (
                    <div className="w-full mb-4 rounded-xl overflow-hidden border border-surface-100 bg-surface-900 flex justify-center items-center">
                        <img src={post.mediaUrl} alt="Post attachment" className="w-full h-auto object-contain max-h-[500px]" />
                    </div>
                )}

                {post.mediaUrl && post.mediaType === "VIDEO" && (
                    <div className="w-full mb-4 rounded-xl overflow-hidden border border-surface-100 bg-surface-900 flex justify-center items-center">
                        <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px] outline-none" />
                    </div>
                )}

                {post.mediaUrl && post.mediaType === "DOCUMENT" && (
                    <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="w-full mb-4 bg-surface-100 hover:bg-surface-200 border border-surface-200 rounded-xl p-4 flex items-center gap-3 transition-colors text-surface-900 font-medium group block">
                        <div className="w-10 h-10 rounded-lg bg-surface-50 text-brand-500 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                            📎
                        </div>
                        <div>
                            <div className="text-sm">Attached Document</div>
                            <div className="text-xs text-surface-900/60 font-normal">Click to view or download</div>
                        </div>
                    </a>
                )}

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-100">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors text-sm font-medium ${liked ? 'text-brand-500' : 'text-surface-900/60 hover:text-brand-500'}`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-brand-500' : ''}`} />
                        <span>{likeCount}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 transition-colors text-sm font-medium ${showComments ? 'text-surface-900' : 'text-surface-900/60 hover:text-surface-900'}`}
                    >
                        <MessageSquare className={`w-4 h-4 ${showComments ? 'fill-surface-900' : ''}`} />
                        <span>{commentCount} Comments</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 transition-colors text-sm font-medium text-surface-900/60 hover:text-brand-500 ml-auto"
                        title="Copy post link"
                    >
                        {copied ? <Check className="w-4 h-4 text-brand-500" /> : <Share2 className="w-4 h-4" />}
                        <span className={copied ? "text-brand-500" : ""}>{copied ? "Copied!" : "Share"}</span>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-surface-100/50 space-y-4">

                        {/* Comments List */}
                        {comments.length > 0 ? (
                            <div className="space-y-3">
                                {comments.map((comment: any, idx: number) => (
                                    <div key={comment.id || idx} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-100 flex-shrink-0 flex items-center justify-center font-bold text-xs text-surface-900/60 border border-surface-200">
                                            {comment.author?.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 bg-surface-800/50 p-3 rounded-lg border border-surface-100/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-surface-900 text-xs">{comment.author?.name}</span>
                                                <span className="text-[10px] text-surface-900/50">
                                                    {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt)) : 'just now'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-surface-900/80">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-surface-900/50 italic">No comments yet. Be the first to share your thoughts!</p>
                        )}

                        {/* Comment Input */}
                        {session ? (
                            <form onSubmit={handleComment} className="flex gap-2 mt-4">
                                <div className="w-8 h-8 rounded-full bg-brand-500 flex-shrink-0 flex items-center justify-center font-bold text-black border border-brand-500 overflow-hidden">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        session.user?.name?.[0] || 'U'
                                    )}
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        className="flex-1 bg-surface-50 border border-surface-100 rounded-full px-4 py-1.5 text-sm text-surface-900 focus:outline-none focus:border-brand-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentContent.trim() || commentLoading}
                                        className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-black hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5 mt-0.5" />}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-sm text-surface-900/60 mt-4 text-center">
                                Please <a href="/login" className="text-brand-500 hover:underline">log in</a> to leave a comment.
                            </div>
                        )}

                    </div>
                )}
            </div>
        </article>
    );
}
