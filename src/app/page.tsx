import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteNavigation } from "@/components/site-navigation";
import { SearchBox } from "@/components/search-box";
import { PreRegisterButton } from "@/components/pre-register-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Users, 
  MapPin,
  Brain,
  Sparkles,
  CheckCircle2,
  Mail,
  Linkedin,
  Twitter
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const { userId } = auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  const stats = [
    { label: "Retail Locations", value: "2,600+", icon: Building2 },
    { label: "Store Data Points", value: "180K+", icon: MapPin },
    { label: "AI Insights Generated", value: "50K+", icon: Brain },
    { label: "Revenue Opportunities", value: "£250M+", icon: TrendingUp },
  ];

  const features = [
    {
      icon: Target,
      title: "Gap Analysis",
      description: "AI-powered tenant mix analysis identifies underserved categories and revenue opportunities across your portfolio.",
      color: "text-blue-500"
    },
    {
      icon: Brain,
      title: "Deep Research",
      description: "Comprehensive data on 2,600+ UK retail properties including tenant mix, footfall, demographics, and market trends.",
      color: "text-purple-500"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Real-time insights into category performance, competitor analysis, and emerging retail trends in your catchment.",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Automated Outreach",
      description: "Find and engage with potential tenants using AI-generated personalized outreach campaigns.",
      color: "text-orange-500"
    },
    {
      icon: Users,
      title: "Tenant Matching",
      description: "Connect vacant units with the right brands based on demographic fit, category gaps, and market demand.",
      color: "text-pink-500"
    },
    {
      icon: Sparkles,
      title: "Actionable Reports",
      description: "Generate beautiful, data-rich PDF reports for stakeholders with clear recommendations and ROI projections.",
      color: "text-indigo-500"
    }
  ];

  const benefits = [
    "Reduce vacancy rates by 20-40%",
    "Identify £2M+ revenue opportunities per center",
    "Cut leasing cycle time in half",
    "Data-driven tenant acquisition strategy",
    "Competitive intelligence at your fingertips",
    "Professional reports in minutes, not weeks"
  ];

  return (
    <>
      <SiteNavigation />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container max-w-6xl mx-auto px-4 pt-20 pb-12">
          <div className="space-y-12">
            {/* Main Headline */}
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                AI-powered deep research and gap analysis for retail properties to unlock{" "}
                <span className="text-primary">new revenue streams</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform vacant units into revenue generators with data-driven insights and automated tenant acquisition
              </p>
            </div>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto">
              <SearchBox />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="p-6 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Demo Video */}
        <section className="bg-muted/50 py-16">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">See Flourish in Action</h2>
                <p className="text-muted-foreground">Watch how we transform retail property management</p>
              </div>
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
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center space-y-2 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to maximize revenue from your retail property portfolio
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-primary/5 py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary">Results That Matter</Badge>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Turn Vacant Units Into Revenue
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Our AI-powered platform has helped property managers identify and capture millions in untapped revenue
                  </p>
                </div>
                <div className="space-y-3">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Queensgate Shopping Centre</CardTitle>
                  <CardDescription>Peterborough, UK</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gap Analysis Score</span>
                      <span className="font-semibold">87/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">7</div>
                      <div className="text-xs text-muted-foreground">Category Gaps</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">£2.4M</div>
                      <div className="text-xs text-muted-foreground">Revenue Potential</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">94</div>
                      <div className="text-xs text-muted-foreground">Current Retailers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-500">96%</div>
                      <div className="text-xs text-muted-foreground">Occupancy Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container max-w-4xl mx-auto px-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-12 text-center space-y-6">
                <h2 className="text-3xl font-bold">Ready to Unlock Hidden Revenue?</h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  Join leading property managers using Flourish AI to maximize their portfolio performance
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <PreRegisterButton />
                  <Link 
                    href="/sign-in" 
                    className="inline-flex items-center justify-center gap-2 border border-background/20 hover:bg-background/10 h-12 px-8 rounded-md font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Image src="/images/logo.png" alt="Flourish" width={120} height={40} className="h-8 w-auto" />
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered retail property intelligence and gap analysis platform
                </p>
                <div className="flex gap-3">
                  <Link 
                    href="https://www.linkedin.com/company/this-is-flourish/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link 
                    href="https://www.instagram.com/this_is_flourish" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="https://www.facebook.com/p/This-is-Flourish-61555483902273/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-4">
                <h3 className="font-semibold">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/gap-analysis" className="hover:text-foreground transition-colors">Gap Analysis</Link></li>
                  <li><Link href="/reports" className="hover:text-foreground transition-colors">Reports</Link></li>
                  <li><Link href="/gap-fulfillment" className="hover:text-foreground transition-colors">Gap Fulfillment</Link></li>
                  <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h3 className="font-semibold">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-4">
                <h3 className="font-semibold">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">GDPR</Link></li>
                </ul>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Flourish AI. All rights reserved.</p>
              <p>Made with ❤️ for retail property managers</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
