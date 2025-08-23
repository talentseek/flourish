"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminActionsProps {
  currentUserId: string;
}

export default function AdminActions({ currentUserId }: AdminActionsProps) {
  const promoteUser = async () => {
    try {
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
      
      if (response.ok) {
        alert('User promoted to admin! Refresh the page to see changes.');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to promote user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error promoting user. Check console for details.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
        <CardDescription>
          Administrative functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Button variant="outline" className="w-full">
            Sync All Users
          </Button>
          <Button variant="outline" className="w-full">
            View System Logs
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Quick Admin Setup</h3>
          <p className="text-sm text-muted-foreground">
            To test admin functionality, you can promote your current user to admin:
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={promoteUser}
            >
              Promote Current User to Admin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
