import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string)?.toUpperCase() || "USER";

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.firstName || "User"}
            </p>
          </div>
          <SignOutButton />
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Role</p>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">{userId}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Navigate to different sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard/profile">
                  View Profile
                </Link>
              </Button>
              {role === "ADMIN" && (
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/admin">
                    Admin Panel
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn how to use this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  This app uses Clerk for authentication. Users are automatically synced to the database via webhooks.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium">Role-Based Access</h4>
                <p className="text-sm text-muted-foreground">
                  Set user roles in Clerk public metadata: <code className="bg-muted px-1 rounded text-xs">{"{ \"role\": \"admin\" }"}</code>
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium">Database</h4>
                <p className="text-sm text-muted-foreground">
                  User data is stored in PostgreSQL using Prisma ORM.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
