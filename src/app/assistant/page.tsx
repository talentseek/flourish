import { auth } from "@/lib/auth"
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlourishAssistantClient } from "@/components/flourish-assistant-client";

export const runtime = 'nodejs';

export default async function AssistantPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Flourish Assistant</h1>
                  <p className="text-muted-foreground">
                    Your AI voice assistant for shopping centre insights and recommendations
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Voice Assistant Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Voice Assistant</CardTitle>
                    <CardDescription>
                      Ask questions about shopping centres, tenant mix, and get recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FlourishAssistantClient />
                  </CardContent>
                </Card>

                {/* Quick Start Guide */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                    <CardDescription>
                      What you can ask the assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span>
                          &quot;Tell me about Manchester Arndale&quot;
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span>
                          &quot;What recommendations do you have for Bluewater Shopping Centre?&quot;
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span>
                          &quot;Compare The Trafford Centre with nearby competitors&quot;
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span>
                          &quot;What tenant categories are missing in my area?&quot;
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">•</span>
                        <span>
                          &quot;Find competitors near Meadowhall&quot;
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                    <CardDescription>
                      Powered by Flourish analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">✓</span>
                        <span>
                          Local area category analysis
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">✓</span>
                        <span>
                          Competitor gap analysis
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">✓</span>
                        <span>
                          Tenant mix recommendations
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">✓</span>
                        <span>
                          Footfall and sales insights
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-semibold">✓</span>
                        <span>
                          Location-specific advice
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

