import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome to Flourish</CardTitle>
            <CardDescription>
              Your modern Next.js application with authentication and database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Get started by signing in to your account
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">
                  Create Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Clerk, Prisma, and shadcn/ui</p>
        </div>
      </div>
    </main>
  );
}
