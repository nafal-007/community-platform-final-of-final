"use client";

import { useState, useEffect } from "react";
import { BookOpen, Loader2, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function QuickNoteWidget() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [content, setContent] = useState("");
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // Fetch the most recent note on mount
    useEffect(() => {
        if (!session || pathname === "/notes") return;
        const fetchRecentNote = async () => {
            try {
                const res = await fetch("/api/notes");
                if (res.ok) {
                    const data = await res.json();
                    if (data.notes && data.notes.length > 0) {
                        // Load the most recently edited note to continue thoughts
                        const recentNote = data.notes[0];
                        setCurrentNoteId(recentNote.id);
                        setContent(recentNote.rawContent);
                    }
                }
            } catch (err) {
                console.error("Failed to load quick note", err);
            }
        };
        fetchRecentNote();
    }, [session, pathname]);

    // Auto-save logic
    useEffect(() => {
        if (content.trim() === "" || !session || pathname === "/notes") return;

        setSaveStatus("saving");
        const timer = setTimeout(async () => {
            setIsSaving(true);
            try {
                const res = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: currentNoteId,
                        content: content
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!currentNoteId) {
                        setCurrentNoteId(data.note.id);
                    }
                    setSaveStatus("saved");
                    setTimeout(() => setSaveStatus("idle"), 2000);
                } else {
                    setSaveStatus("error");
                }
            } catch (error) {
                setSaveStatus("error");
            } finally {
                setIsSaving(false);
            }
        }, 1500); // 1.5 seconds debounce

        return () => clearTimeout(timer);
    }, [content, session, pathname, currentNoteId]);

    if (!session || pathname === "/notes") return null;

    return (
        <div className="glass-panel p-5 sticky top-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-500" />
                    <h3 className="font-bold text-sm text-surface-900">Quick Note</h3>
                </div>
                <div className="text-xs font-bold text-surface-900/50">
                    {saveStatus === "saving" && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
                    {saveStatus === "saved" && <Check className="w-4 h-4 text-green-500" />}
                </div>
            </div>

            <p className="text-xs text-surface-900/60 mb-3">
                Jot down ideas while browsing. Auto-saves to your <a href="/notes" className="text-brand-500 hover:underline">Notes History</a>.
            </p>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your notes here..."
                className="flex-1 w-full bg-surface-50/50 border border-surface-100 rounded-xl p-3 text-surface-900 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors resize-none font-mono text-sm leading-relaxed custom-scrollbar"
            />
        </div>
    );
}
