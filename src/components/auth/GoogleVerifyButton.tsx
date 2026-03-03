"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface GoogleVerifyProps {
    onVerified: (email: string, name: string) => void;
}

export function GoogleVerifyButton({ onVerified }: GoogleVerifyProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [verified, setVerified] = useState(false);

    // Provide a fallback if the environment variable is missing
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID";

    const handleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/google/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            if (!res.ok) {
                throw new Error("Failed to verify Google Token against our servers.");
            }

            const payload = await res.json();

            if (!payload.email_verified) {
                throw new Error("This Google account's email is not verified.");
            }

            setVerified(true);
            onVerified(payload.email, payload.name);

        } catch (err: any) {
            setError(err.message || "Google Verification Error");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="w-full mb-6">
                {!verified && !loading && (
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={() => setError("Google Login Failed on Client.")}
                            theme="outline"
                            text="continue_with"
                            width="250"
                        />
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center p-4 text-surface-900/60 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                        <span className="text-sm">Verifying with Google...</span>
                    </div>
                )}

                {verified && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-500 text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        Email Verified by Google
                    </div>
                )}

                {error && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </GoogleOAuthProvider>
    );
}
