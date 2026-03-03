"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBio: string | null;
    currentImage: string | null;
    currentName: string | null;
    currentUsername: string;
}

export function EditProfileModal({ isOpen, onClose, currentBio, currentImage, currentName, currentUsername }: EditProfileModalProps) {
    const router = useRouter();
    const [bio, setBio] = useState(currentBio || "");
    const [name, setName] = useState(currentName || "");
    const [username, setUsername] = useState(currentUsername || "");
    const [imagePreview, setImagePreview] = useState<string | null>(currentImage);
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("Image must be less than 5MB");
                return;
            }
            setFile(selectedFile);
            setError("");
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError("");

        try {
            let avatarUrl = currentImage;

            // 1. Upload new image if selected
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload image.");
                }

                const uploadData = await uploadRes.json();
                avatarUrl = uploadData.url;
            }

            // 2. Update Profile Data
            const updateRes = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bio: bio,
                    image: avatarUrl,
                    name: name,
                    username: username
                }),
            });

            if (!updateRes.ok) {
                throw new Error("Failed to update profile.");
            }

            // Successfully updated
            router.refresh(); // Refresh server component data
            onClose();

        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative glass-panel w-full max-w-md p-6 flex flex-col items-center">

                <button onClick={onClose} className="absolute top-4 right-4 text-surface-900/60 hover:text-surface-900 transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-surface-900 mb-6 w-full text-left">Edit Profile</h2>

                {error && (
                    <div className="w-full mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                        {error}
                    </div>
                )}

                {/* Avatar Upload */}
                <div className="relative w-32 h-32 mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-full h-full rounded-full border-4 border-surface-100 bg-surface-800 overflow-hidden flex items-center justify-center relative">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-surface-900/50" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-surface-900" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                    />
                </div>
                <p className="text-xs text-brand-500 font-bold mb-6">Click to change Avatar (Max 5MB)</p>

                {/* Name & Username Inputs */}
                <div className="w-full flex gap-4 mb-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-surface-900 block">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            maxLength={50}
                            className="w-full bg-surface-50 border border-surface-100 text-surface-900 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-surface-900 block flex justify-between">
                            Username
                            <span className="text-xs text-surface-900/50 font-normal">20-day limit</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (!val.startsWith("@")) val = "@" + val.replace(/@/g, "");
                                val = val.toLowerCase().replace(/[^a-z0-9_@.]/g, "");
                                setUsername(val);
                            }}
                            placeholder="@username"
                            maxLength={20}
                            className="w-full bg-surface-50 border border-surface-100 text-surface-900 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Bio Input */}
                <div className="w-full space-y-2 mb-6">
                    <label className="text-sm font-bold text-surface-900 block">Short Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the community about yourself..."
                        maxLength={160}
                        className="w-full bg-surface-50 border border-surface-100 text-surface-900 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm resize-none h-24 placeholder:text-surface-900/40"
                    />
                    <div className="text-right text-xs text-surface-900/50">{bio.length}/160</div>
                </div>

                <div className="w-full flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-surface-100 text-surface-900 font-bold hover:bg-surface-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-3 px-4 rounded-xl bg-brand-500 text-black font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
}
