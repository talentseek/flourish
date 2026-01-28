import { getRegionalLocations } from '@/actions/regional-data';
import AiChat from '@/components/regional/ai-chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import Map to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import('@/components/regional/regional-map'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg" />
});

export default async function RegionalDashboard() {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
        redirect('/login');
    }

    // Fetch role from database
    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true }
    });

    if (!dbUser || dbUser.role !== 'REGIONAL_MANAGER') {
        redirect('/dashboard');
    }

    const locations = await getRegionalLocations();

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Regional Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {dbUser.name}. You are managing {locations.length} locations.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Map + Stats) - Spans 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Map View</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <DynamicMap locations={locations} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {locations.map(loc => (
                            <Card key={loc.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">{loc.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{loc.city}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {loc.footfall ? `${(loc.footfall / 1000000).toFixed(1)}m Footfall` : 'Footfall N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar (AI Chat) - Spans 1 col */}
                <div className="lg:col-span-1">
                    <AiChat />
                </div>
            </div>
        </div>
    );
}
