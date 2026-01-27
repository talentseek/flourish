"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Manually trigger the correct endpoint to bypass client library name mismatch
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/auth/request-password-reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, redirectTo: "/reset-password" }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message || "Failed to send reset link");
                setLoading(false);
                return;
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
            setLoading(false);
            return;
        }

        /* 
        // Original client call - fails due to endpoint mismatch
        const { error } = await authClient.forgetPassword({
            email,
            redirectTo: "/reset-password" 
        });

        if (error) {
            toast.error(error.message || "Failed to send reset email");
            setLoading(false);
            return;
        }
        */

        toast.success("Reset email sent!");
        setSubmitted(true);
        setLoading(false);
    };

    if (submitted) {
        return (
            <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-green-400">Check your inbox</CardTitle>
                    <CardDescription className="text-center text-zinc-300">
                        We have sent a password reset link to <span className="font-semibold text-white">{email}</span>.
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

    return (
        <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                    Enter your email to receive a reset link
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200">
                    <AlertTitle>Migrated from the old system?</AlertTitle>
                    <AlertDescription>
                        For security reasons, passwords were not migrated. Please reset your password here to regain access.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            className="bg-black/20 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Reset Link
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
