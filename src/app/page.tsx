"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Clock,
  BookOpen,
  AlertCircle,
  PlusCircle,
  Users,
  Hash,
  Activity,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useTimeTracker } from "@/components/providers/TimeTrackerProvider";
import PostCard from "@/components/post/PostCard";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [joinedCommunities, setJoinedCommunities] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const { totalSecondsToday } = useTimeTracker();

  // Post Creator State
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const progressPercentage = Math.min((totalSecondsToday / 7200) * 100, 100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user) {
          const communitiesRes = await fetch('/api/communities/joined');
          if (communitiesRes.ok) {
            const data = await communitiesRes.json();
            setJoinedCommunities(data);
            if (data.length > 0) setSelectedCommunityId(data[0].community.id);
          }
        }

        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchData();
  }, [session]);

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !selectedCommunityId) return;

    setIsPosting(true);
    try {
      const res = await fetch(`/api/communities/${selectedCommunityId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistically add to top of feed
        setPosts([data.post, ...posts]);
        setPostTitle("");
        setPostContent("");
        toast.success("Post created successfully!");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full pt-6 pb-20">

      {/* Joined Communities Bar */}
      {joinedCommunities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-surface-900/60 mb-3 px-1 uppercase tracking-wider">Your Communities</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {joinedCommunities.map((c: any) => (
              <Link
                href={`/c/${c.community.name}`}
                key={c.community.id}
                className="flex flex-col items-center gap-2 min-w-[72px] group snap-start"
              >
                <div className="w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-surface-100 to-surface-200 group-hover:from-brand-500 group-hover:to-brand-400 transition-all duration-300 shadow-md">
                  <div className="w-full h-full rounded-xl bg-surface-800 border-2 border-surface-900 flex items-center justify-center overflow-hidden">
                    {c.community.avatarUrl ? (
                      <img src={c.community.avatarUrl} alt={c.community.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    ) : (
                      <Hash className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-surface-900/60 group-hover:text-surface-900 transition-colors truncate w-full text-center font-medium">
                  {c.community.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Digital Wellbeing Widget */}
      <div className="glass-panel p-5 mb-8 flex items-center justify-between border-brand-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/30">
            <Activity className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h3 className="text-surface-900 font-bold text-lg">Digital Wellbeing</h3>
            <p className="text-surface-900/60 text-sm">Time spent on US today</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-surface-900 font-mono">{formatTime(totalSecondsToday)}</span>
            <span className="text-surface-900/50 text-xs uppercase tracking-wider">/ 2h Limit</span>
          </div>
          <div className="w-48 h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${progressPercentage > 90 ? 'bg-red-500' : progressPercentage > 75 ? 'bg-orange-500' : 'bg-brand-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Post Creator Widget */}
      {session && joinedCommunities.length > 0 && (
        <div className="glass-panel p-5 mb-8 border border-white/5">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-brand-500 shrink-0 flex items-center justify-center text-black font-bold shadow-lg shadow-brand-500/20">
              {session.user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="text"
                placeholder="Title of your post"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-surface-900/50 border border-surface-100 rounded-xl px-4 py-2.5 text-surface-900 placeholder:text-surface-900/40 focus:outline-none focus:border-brand-500/50 transition-all text-sm font-bold"
              />
              <textarea
                placeholder="What happened today? Share structured news, jobs, or updates..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full bg-surface-900/50 border border-surface-100 rounded-xl px-4 py-3 text-surface-900 placeholder:text-surface-900/40 resize-none focus:outline-none focus:border-brand-500/50 transition-all text-sm min-h-[100px] leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold text-surface-900/50 uppercase tracking-tighter">Post to:</span>
                  <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="flex-1 sm:flex-none bg-surface-800 border border-surface-100 rounded-lg px-3 py-1.5 text-xs text-surface-900 focus:outline-none focus:border-brand-500 transition-colors font-medium"
                  >
                    {joinedCommunities.map((c: any) => (
                      <option key={c.community.id} value={c.community.id}>
                        {c.community.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || !postTitle.trim() || !postContent.trim()}
                  className="w-full sm:w-auto px-8 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {isPosting ? "Posting..." : "Share Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!session && (
        <div className="glass-panel p-8 mb-8 text-center border-dashed border-surface-100">
          <p className="text-surface-900/60 mb-4">You must be logged in to share information with the community.</p>
          <Link href="/login" className="px-6 py-2 bg-brand-500 text-black font-bold rounded-lg text-sm">Log In Now</Link>
        </div>
      )}

      {session && joinedCommunities.length === 0 && (
        <div className="glass-panel p-8 mb-8 text-center border-dashed border-surface-100">
          <Users className="w-10 h-10 text-surface-900/50 mx-auto mb-3" />
          <p className="text-surface-900/60 mb-4 font-medium">Join a community to start posting!</p>
          <Link href="/communities" className="px-6 py-2 bg-surface-100 text-surface-900 font-bold rounded-lg text-sm hover:bg-surface-200 transition-colors">Explore Communities</Link>
        </div>
      )}

      {/* Main Feed Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-surface-900">Your Feed</h3>
          <div className="flex items-center gap-2 text-sm bg-surface-800 border border-surface-100 rounded-lg p-1">
            <button className="px-3 py-1 bg-surface-100 text-surface-900 rounded-md font-medium">Recent</button>
            <button className="px-3 py-1 text-surface-900/50 hover:text-surface-900 font-medium transition-colors">Top Rated</button>
          </div>
        </div>

        {isLoadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel p-5 h-40 animate-pulse bg-surface-800/50" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          /* Empty Feed State */
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-surface-100">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4 border border-surface-100">
              <Users className="w-8 h-8 text-surface-900/50" />
            </div>
            <h4 className="text-lg font-bold text-surface-900 mb-2">Build your network</h4>
            <p className="text-surface-900/60 text-sm max-w-sm">
              Your feed is currently empty. Join communities or follow users to populate your feed with validated information.
            </p>
            <Link href="/communities" className="mt-6 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-black rounded-lg font-bold transition-colors text-sm shadow-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Explore Communities
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
