"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
            <div className="w-full max-w-md">
                {/* App Branding */}
                <div className="flex flex-col items-center mb-10">
                    <Logo className="mb-4" iconSize="w-16 h-16" textSize="text-5xl" dark={true} />
                    <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Welcome back</h1>
                    <p className="text-surface-900/60 mt-2">Log in to your US account</p>
                </div>

                {/* Login Form Card */}
                <div className="glass-panel p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-surface-900 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-900/50" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm mb-1 placeholder:text-surface-900/40"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-surface-900 block">Password</label>
                                <Link href="#" className="text-xs font-bold text-brand-500 hover:text-brand-600">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-900/50" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-100 text-surface-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder:text-surface-900/40"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-black py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "Sign in"}
                            {!loading && <ArrowRight className="w-4 h-4 text-black" />}
                        </button>
                    </form>

                    <div className="mt-8 relative hidden">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-surface-900/50">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center text-sm">
                        <span className="text-surface-900/60">Don&apos;t have an account? </span>
                        <Link href="/register" className="ml-1 font-bold text-brand-500 hover:text-brand-600">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
