import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteNavigation } from "@/components/site-navigation";
import { SearchBox } from "@/components/search-box";

export default async function HomePage() {
  const { userId } = auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <SiteNavigation />
      <main className="min-h-screen flex items-start justify-center bg-background p-4 pt-20">
        <div className="max-w-4xl w-full space-y-12">
          {/* Main Headline */}
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              AI-powered deep research and gap analysis for shopping centres to unlock{" "}
              <span className="text-primary">new revenue streams</span>
            </h1>
          </div>

          {/* Search Box */}
          <div className="text-center">
            <SearchBox />
          </div>
        </div>
      </main>
    </>
  );
}
