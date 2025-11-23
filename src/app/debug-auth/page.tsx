"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugAuthPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const checkRedirects = () => {
    console.log("Environment variables:");
    console.log("NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:", process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL);
    console.log("NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:", process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL);
    console.log("NEXT_PUBLIC_CLERK_SIGN_IN_URL:", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL);
    console.log("NEXT_PUBLIC_CLERK_SIGN_UP_URL:", process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL);
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
            <CardDescription>
              Check authentication state and redirect configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Is Signed In:</label>
                <p className="text-sm text-muted-foreground">{isSignedIn ? "Yes" : "No"}</p>
              </div>
              {user && (
                <div>
                  <label className="text-sm font-medium">User Email:</label>
                  <p className="text-sm text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">User ID:</label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id || "Not signed in"}</p>
              </div>
            </div>
            
            <Button onClick={checkRedirects} className="w-full">
              Check Redirect URLs (see console)
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>If you&apos;re signed in but not being redirected to dashboard, check the console for redirect URL configuration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
