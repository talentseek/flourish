"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLoaded) {
      setError("Clerk is not loaded yet. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting sign up with:", { email, firstName, lastName });
      
      if (!signUp) {
        throw new Error("SignUp is not available");
      }

      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      console.log("Sign up result:", result);

      if (result?.status === "complete") {
        // Don't call setActive here - let Clerk handle the session automatically
        
        // Update user profile with firstName and lastName if provided
        if (firstName || lastName) {
          try {
            await signUp.update({
              firstName: firstName || undefined,
              lastName: lastName || undefined,
            });
            console.log("User profile updated successfully");
          } catch (updateError) {
            console.error("Error updating user profile:", updateError);
            // Continue anyway - this is not critical
          }
        }
        
        // For local development, manually sync user to database
        if (process.env.NODE_ENV === "development") {
          try {
            const response = await fetch("/api/sync-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: result.createdUserId,
                email: email,
                role: "USER"
              })
            });
            if (!response.ok) {
              console.warn("Failed to sync user to database");
            }
          } catch (error) {
            console.warn("Failed to sync user to database:", error);
          }
        }
        
        router.push("/dashboard");
      } else if (result?.status === "missing_requirements") {
        // Email verification required
        setPendingVerification(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        errors: err.errors,
        stack: err.stack
      });
      
      if (err.errors?.[0]?.message) {
        setError(err.errors[0].message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting verification with code:", code);
      
      const result = await signUp?.attemptEmailAddressVerification({
        code: code.trim(),
      });

      console.log("Verification result:", result);

      if (result?.status === "complete") {
        // Don't call setActive here - let Clerk handle the session automatically
        
        // For local development, manually sync user to database
        if (process.env.NODE_ENV === "development") {
          try {
            const response = await fetch("/api/sync-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: result.createdUserId,
                email: email,
                role: "USER"
              })
            });
            if (!response.ok) {
              console.warn("Failed to sync user to database");
            }
          } catch (error) {
            console.warn("Failed to sync user to database:", error);
          }
        }
        
        // Show success message before redirecting
        alert("Email verified successfully! Redirecting to dashboard...");
        router.push("/dashboard");
      } else {
        setError("Invalid verification code. Please check your email and try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        errors: err.errors,
        stack: err.stack
      });
      
      if (err.errors?.[0]?.message) {
        setError(err.errors[0].message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      console.log("Preparing email verification...");
      await signUp?.prepareEmailAddressVerification();
      setError(""); // Clear any previous errors
      alert("Verification code sent! Check your email.");
    } catch (err: any) {
      console.error("Resend code error:", err);
      if (err.errors?.[0]?.message) {
        setError(err.errors[0].message);
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pendingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>
            </form>
            
            <Separator className="my-6" />
            
            <div className="text-center space-y-2">
              <Button 
                variant="outline" 
                onClick={handleResendCode}
                className="w-full"
                disabled={isLoading}
              >
                Resend code
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setPendingVerification(false)}
                className="w-full"
                disabled={isLoading}
              >
                Back to sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create account</CardTitle>
          <CardDescription>
            Sign up to get started with Flourish
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          
          <Separator className="my-6" />
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
