"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    if (errorParam === "INVALID_TOKEN") {
        return (
            <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-red-400">Invalid or Expired Link</CardTitle>
                    <CardDescription className="text-center text-zinc-300">
                        This password reset link is invalid or has expired. Please request a new one.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/forgot-password">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            Request New Link
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    if (!token) {
        return (
            <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-red-400">Missing Token</CardTitle>
                    <CardDescription className="text-center text-zinc-300">
                        Invalid link. Please check your email and try again.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        const { error } = await authClient.resetPassword({
            newPassword: password,
            token
        });

        if (error) {
            toast.error(error.message || "Failed to reset password");
            setLoading(false);
            return;
        }

        toast.success("Password reset successfully!");
        setLoading(false);
        router.push("/login");
    };

    return (
        <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                    Enter your new password below
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="pl-9 pr-10 bg-black/20 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="pl-9 bg-black/20 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Reset Password
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Link href="/login" className="text-sm text-zinc-400 hover:text-white flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
            </CardFooter>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
