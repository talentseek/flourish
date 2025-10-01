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
              AI-powered deep research and gap analysis for retail properties to unlock{" "}
              <span className="text-primary">new revenue streams</span>
            </h1>
          </div>

          {/* Search Box */}
          <div className="text-center">
            <SearchBox />
          </div>

          {/* Demo Video */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-center">See Flourish in action</h2>
            <div className="rounded-lg border border-border bg-card p-2">
              <video
                className="w-full h-auto rounded-md"
                controls
                poster="/screenshot.png"
              >
                <source src="/flourish.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
