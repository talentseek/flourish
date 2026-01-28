import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from '@/lib/db';

// Initialize OpenRouter
const openRouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Pre-fetch location data to include in system prompt
    const locations = await prisma.location.findMany({
        where: { isManaged: true },
        select: {
            name: true,
            city: true,
            postcode: true,
            footfall: true,
            retailSpace: true,
            numberOfStores: true,
            regionalManager: true,
        },
        take: 50
    });

    const locationContext = locations.map(l =>
        `- ${l.name} (${l.city}, ${l.postcode}): ${l.footfall?.toLocaleString() || 'N/A'} footfall, ${l.retailSpace?.toLocaleString() || 'N/A'} sqft, ${l.numberOfStores || 'N/A'} stores. RM: ${l.regionalManager || 'Unassigned'}`
    ).join('\n');

    const result = await streamText({
        model: openRouter('google/gemini-2.0-flash-exp:free'),
        messages,
        system: `You are a helpful assistant for a Regional Manager at Flourish, a retail location intelligence platform.

Here are the managed locations you can help with:
${locationContext}

When answering questions:
- Reference specific locations by name when relevant
- Provide footfall and size comparisons when asked
- If asked about surrounding areas, use your knowledge to describe nearby amenities, transport links, and demographics
- Be concise and professional`,
    });

    return result.toTextStreamResponse();
}
