import { prisma } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
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

    const locationContext = locations.map((l: {
        name: string;
        city: string;
        postcode: string;
        footfall: number | null;
        retailSpace: number | null;
        numberOfStores: number | null;
        regionalManager: string | null;
    }) =>
        `- ${l.name} (${l.city}, ${l.postcode}): ${l.footfall?.toLocaleString() || 'N/A'} footfall, ${l.retailSpace?.toLocaleString() || 'N/A'} sqft, ${l.numberOfStores || 'N/A'} stores. RM: ${l.regionalManager || 'Unassigned'}`
    ).join('\n');

    const systemPrompt = `You are a helpful assistant for a Regional Manager at Flourish, a retail location intelligence platform.

Here are the managed locations you can help with:
${locationContext}

When answering questions:
- Reference specific locations by name when relevant
- Provide footfall and size comparisons when asked
- If asked about surrounding areas, use your knowledge to describe nearby amenities, transport links, and demographics
- Be concise and professional`;

    // Convert messages to simple format
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

    // Create a readable stream from the OpenAI response
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
