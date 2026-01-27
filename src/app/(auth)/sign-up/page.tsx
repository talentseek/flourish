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

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/dashboard"
        });

        if (error) {
            toast.error(error.message || "Failed to sign up");
            setLoading(false);
            return;
        }

        toast.success("Account created!");
        router.push("/dashboard");
    };

    return (
        <Card className="bg-black/40 border-zinc-800 text-white backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                    Get started with Flourish Intelligence
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            required
                            className="bg-black/20 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
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
                        <Label htmlFor="password">Password</Label>
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
                        Create Account
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 mt-2">
                <div className="text-sm text-center text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
