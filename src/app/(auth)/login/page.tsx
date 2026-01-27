"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard"
        });

        if (error) {
            toast.error(error.message || "Invalid credentials");
            setLoading(false);
            return;
        }

        toast.success("Welcome back!");
        router.push("/dashboard");
    };

    return (
        <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                    Enter your email to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
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
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            className="bg-black/20 border-zinc-700 text-white focus:border-purple-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign In
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 mt-2">
                <p className="text-muted-foreground mt-2">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 font-medium">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
