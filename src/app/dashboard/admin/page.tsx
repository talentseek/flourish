import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminActions from "./admin-actions";

export default async function AdminPage() {
  const user = await getSessionUser();
  
  // Check if user exists and has admin role
  if (!user) {
    redirect("/");
  }
  
  // Get user from database to check role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });
  
  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all users from database
  const dbUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {user.id}. You have admin privileges.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Database Users</CardTitle>
              <CardDescription>
                Total users in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dbUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Users synced from Clerk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Users with admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dbUsers.filter((u: { role: string }) => u.role === 'ADMIN').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of {dbUsers.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regular Users</CardTitle>
              <CardDescription>
                Users with standard privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dbUsers.filter((u: { role: string }) => u.role === 'USER').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Standard accounts
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dbUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No users found in database.</p>
                <p className="text-sm mt-2">
                  Users will appear here after they sign up and are synced via webhooks.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dbUsers.map((dbUser: { id: string; email: string; role: string; createdAt: Date }) => (
                  <div key={dbUser.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{dbUser.email}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {dbUser.id} • Role: {dbUser.role}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(dbUser.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={dbUser.role === 'ADMIN' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {dbUser.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AdminActions currentUserId={user.id} />
      </div>
    </div>
  );
}
