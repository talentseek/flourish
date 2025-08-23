"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DebugUserPage() {
  const { user, isLoaded } = useUser();
  const [promoteResult, setPromoteResult] = useState<any>(null);

  const syncUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          role: "USER"
        })
      });
      
      if (response.ok) {
        alert("User synced successfully!");
      } else {
        alert("Failed to sync user");
      }
    } catch (error) {
      console.error("Error syncing user:", error);
      alert("Error syncing user");
    }
  };

  const promoteToAdmin = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/test-promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await response.json();
      setPromoteResult(result);
      
      if (response.ok) {
        alert("User promoted to admin! Check the result below.");
      } else {
        alert("Failed to promote user");
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Error promoting user");
    }
  };

  const testClerkUpdate = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/test-clerk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await response.json();
      setPromoteResult(result);
      
      if (response.ok) {
        alert("Clerk metadata updated! Check the result below.");
      } else {
        alert("Failed to update Clerk metadata");
      }
    } catch (error) {
      console.error("Error updating Clerk metadata:", error);
      alert("Error updating Clerk metadata");
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Not signed in</div>
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
            <CardTitle>Current User Info</CardTitle>
            <CardDescription>
              Debug information about your current user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">User ID:</label>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email:</label>
                <p className="text-sm text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium">First Name:</label>
                <p className="text-sm text-muted-foreground">{user.firstName || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Name:</label>
                <p className="text-sm text-muted-foreground">{user.lastName || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Public Metadata:</label>
                <pre className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  {JSON.stringify(user.publicMetadata, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={syncUser} variant="outline">
                Sync User to Database
              </Button>
              <Button onClick={promoteToAdmin} variant="default">
                Promote to Admin
              </Button>
              <Button onClick={testClerkUpdate} variant="secondary">
                Test Clerk Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {promoteResult && (
          <Card>
            <CardHeader>
              <CardTitle>Promote Result</CardTitle>
              <CardDescription>
                Result of the promotion attempt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(promoteResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
