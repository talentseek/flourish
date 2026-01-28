import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Get current user's name to filter their locations
    const sessionUser = await getSessionUser();
    const userName = sessionUser?.name || '';

    // Fetch only locations managed by this user
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            regionalManager: userName, // Filter by current user's name
        },
        select: {
            name: true,
            city: true,
            postcode: true,
            footfall: true,
            retailSpace: true,
            numberOfStores: true,
            parkingSpaces: true,
            website: true,
            tenants: {
                select: { name: true, category: true }
            }
        },
    });

    // Build detailed context for each location
    const locationContext = locations.map((l: {
        name: string;
        city: string;
        postcode: string;
        footfall: number | null;
        retailSpace: number | null;
        numberOfStores: number | null;
        parkingSpaces: number | null;
        website: string | null;
        tenants: { name: string; category: string | null }[];
    }) => {
        const tenantList = l.tenants.length > 0
            ? `Tenants: ${l.tenants.slice(0, 10).map(t => t.name).join(', ')}${l.tenants.length > 10 ? ` (+${l.tenants.length - 10} more)` : ''}`
            : 'Tenants: Data not available';

        return `- ${l.name} (${l.city}, ${l.postcode || 'N/A'}):
    Footfall: ${l.footfall ? `${(l.footfall / 1000000).toFixed(1)}m` : 'N/A'}
    Retail Space: ${l.retailSpace?.toLocaleString() || 'N/A'} sqft
    Stores: ${l.numberOfStores || 'N/A'}
    Parking: ${l.parkingSpaces?.toLocaleString() || 'N/A'} spaces
    Website: ${l.website || 'N/A'}
    ${tenantList}`;
    }).join('\n\n');

    const systemPrompt = `You are a helpful assistant for ${userName || 'a Regional Manager'} at Flourish, a retail location intelligence platform.

${locations.length > 0 ? `You manage ${locations.length} locations:

${locationContext}` : 'No locations are currently assigned to you.'}

When answering questions:
- Reference specific locations by name when relevant
- Provide footfall, parking, and size data when asked
- If asked about surrounding areas, use your knowledge to describe nearby amenities, transport links, and demographics
- Be concise and professional
- If you don't have specific data, say so clearly`;

    const formattedMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        }))
    ];

    const response = await openai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: formattedMessages,
        stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
