"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, Users, Hash, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<{ communities: any[], users: any[] }>({ communities: [], users: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (query.trim()) {
            handleSearch(query);
        }
    }, [query]);

    const handleSearch = async (q: string) => {
        setIsLoading(true);
        try {
            const [commRes, userRes] = await Promise.all([
                fetch(`/api/communities?q=${encodeURIComponent(q)}`),
                fetch(`/api/users/profile?search=${encodeURIComponent(q)}`)
            ]);

            const communities = commRes.ok ? await commRes.json() : [];
            const users = userRes.ok ? await userRes.json() : [];

            setResults({ communities, users });
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-surface-900 mb-2 flex items-center gap-3">
                    <SearchIcon className="w-8 h-8 text-brand-500" />
                    Search Results
                </h1>
                <p className="text-surface-900/60">Showing results for <span className="text-brand-500 font-bold">"{query}"</span></p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                    <p className="text-surface-900/50 font-medium">Scanning US platform...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Communities Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-surface-900/60 font-bold text-sm uppercase tracking-wider mb-2">
                            <Hash className="w-4 h-4" />
                            Communities ({results.communities.length})
                        </div>
                        {results.communities.length > 0 ? (
                            results.communities.map((c: any) => (
                                <Link
                                    key={c.id}
                                    href={`/c/${c.name}`}
                                    className="block glass-panel p-4 border border-surface-100 hover:border-brand-500/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-surface-900 group-hover:text-brand-500 transition-colors uppercase tracking-tight">#{c.name}</h3>
                                            <p className="text-xs text-surface-900/50 line-clamp-1">{c.description}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-surface-900/40 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="glass-panel p-6 text-center border-dashed text-surface-900/50 text-sm border-surface-100">
                                No communities found matching your search.
                            </div>
                        )}
                    </div>

                    {/* Users Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-surface-900/60 font-bold text-sm uppercase tracking-wider mb-2">
                            <Users className="w-4 h-4" />
                            Users ({results.users.length})
                        </div>
                        {results.users.length > 0 ? (
                            results.users.map((u: any) => (
                                <Link
                                    key={u.id}
                                    href={`/u/${u.username}`}
                                    className="block glass-panel p-4 border border-surface-100 hover:border-brand-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center font-bold text-surface-900 border border-surface-200 overflow-hidden">
                                            {u.image ? <img src={u.image} alt={u.username} className="w-full h-full object-cover" /> : u.name?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-surface-900 group-hover:text-brand-500 transition-colors">@{u.username}</h3>
                                            <p className="text-xs text-surface-900/50">{u.name}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-surface-900/40 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="glass-panel p-6 text-center border-dashed text-surface-900/50 text-sm border-surface-100">
                                No users found matching your search.
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
