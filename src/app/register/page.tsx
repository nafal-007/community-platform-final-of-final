"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
// Removed GoogleVerifyButton

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // OTP States
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send code");

            setOtpSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: otp }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid verification code");

            // Move to Step 2
            setStep(2);
            setError("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Registration failed");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
            <div className="w-full max-w-md">
                {/* App Branding */}
                <div className="flex flex-col items-center mb-10">
                    <Logo className="mb-4" iconSize="w-16 h-16" textSize="text-5xl" dark={true} />
                    <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Create an Account</h1>
                    <p className="text-surface-900/60 mt-2">Join US today</p>
                </div>

                {/* Register Form Card */}
                <div className="glass-panel p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-500">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success ? (
                        <div className="p-8 text-center bg-brand-50 border border-brand-100 rounded-xl space-y-4">
                            <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto" />
                            <h3 className="text-lg font-bold text-brand-900">Registration Successful!</h3>
                            <p className="text-sm text-brand-700">Redirecting to login...</p>
                        </div>
                    ) : (
                        <div>
                            {step === 1 ? (
                                // STEP 1: EMAIL & OTP VERIFICATION
                                <div className="space-y-6">
                                    <h2 className="text-lg font-bold text-surface-900 mb-2">Step 1: Verify your email</h2>

                                    <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-surface-900 block">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-900/50" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={email || ""}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    readOnly={otpSent}
                                                    className={`w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-surface-900/40 ${otpSent ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                        </div>

                                        {otpSent && (
                                            <div className="space-y-2 translate-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <label className="text-sm font-bold text-surface-900 block">6-Digit Code</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-900/50" />
                                                    <input
                                                        type="text"
                                                        id="otp"
                                                        name="otp"
                                                        required
                                                        value={otp || ""}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        maxLength={6}
                                                        className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-brand-500/50 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-lg font-mono tracking-[0.5em] placeholder:tracking-normal placeholder:text-surface-900/40"
                                                        placeholder="123456"
                                                    />
                                                </div>
                                                <p className="text-xs text-surface-900/60">Please check your inbox (and spam folder) for the verification code.</p>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-black py-3 rounded-xl font-bold transition-all shadow-sm mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : (otpSent ? "Verify & Continue" : "Send Verification Code")}
                                            {!loading && <ArrowRight className="w-4 h-4 text-black" />}
                                        </button>

                                        {otpSent && (
                                            <button
                                                type="button"
                                                onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                                                className="w-full mt-2 text-sm text-surface-900/60 hover:text-surface-900 transition-colors"
                                            >
                                                Change Email Address
                                            </button>
                                        )}
                                    </form>
                                </div>
                            ) : (
                                // STEP 2: ACCOUNT DETAILS
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center gap-2 mb-6 p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-brand-500" />
                                        <span className="text-sm font-bold text-brand-500">{email}</span>
                                    </div>

                                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-surface-900 block">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-900/50" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-surface-900/40"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-surface-900 block">Username</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-surface-900/50">@</div>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    required
                                                    pattern="[a-zA-Z0-9_]+"
                                                    title="Only letters, numbers, and underscores are allowed."
                                                    className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-surface-900/40"
                                                    placeholder="johndoe"
                                                />
                                            </div>
                                            <p className="text-xs text-surface-900/50">This will be your unique handle.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-surface-900 block">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-900/50" />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    required
                                                    minLength={6}
                                                    className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder:text-surface-900/40"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <p className="text-xs text-surface-900/50">Must be at least 6 characters</p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-black py-3 rounded-xl font-bold transition-all shadow-sm mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "Create Account"}
                                            {!loading && <ArrowRight className="w-4 h-4 text-black" />}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {!success && (
                        <div className="mt-6 flex justify-center text-sm">
                            <span className="text-surface-900/60">Already have an account? </span>
                            <Link href="/login" className="ml-1 font-bold text-brand-500 hover:text-brand-600">
                                Log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
