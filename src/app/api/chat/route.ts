
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getRegionalLocations } from '@/actions/regional-data';
import { z } from 'zod';

// Initialize OpenRouter
const openRouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: openRouter('google/gemini-2.0-flash-exp:free'),
        messages,
        system: `You are a helper for a Regional Manager. You have access to their managed locations.`,
        tools: {
            get_dashboard_data: {
                description: 'Get list of managed locations and their key stats.',
                parameters: z.object({}),
                execute: async () => {
                    const locs = await getRegionalLocations();
                    return locs.map(l => ({
                        id: l.id,
                        name: l.name,
                        city: l.city,
                        footfall: l.footfall,
                        retailSpace: l.retailSpace
                    }));
                },
            },
            search_web: {
                description: 'Search for surrounding area info (simulated).',
                parameters: z.object({ query: z.string() }),
                execute: async ({ query }) => {
                    return `(Simulated Web Search) Info for "${query}" near the location.`;
                }
            }
        },
    });

    return result.toDataStreamResponse();
}
