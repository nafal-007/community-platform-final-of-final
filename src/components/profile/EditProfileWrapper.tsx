"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";

interface EditProfileWrapperProps {
    currentBio: string | null;
    currentImage: string | null;
    currentName: string | null;
    currentUsername: string;
}

export function EditProfileWrapper({ currentBio, currentImage, currentName, currentUsername }: EditProfileWrapperProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-100 text-surface-900 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
                <Edit3 className="w-4 h-4" />
                Edit Profile
            </button>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentBio={currentBio}
                currentImage={currentImage}
                currentName={currentName}
                currentUsername={currentUsername}
            />
        </>
    );
}
