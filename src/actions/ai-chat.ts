'use server';

import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { getRegionalLocations } from '@/actions/regional-data';

// Initialize OpenRouter as an OpenAI compatible provider
const openRouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function continueConversation(history: any[]) {
    'use server';

    const stream = await streamText({
        model: openRouter('google/gemini-2.0-flash-exp:free'),
        messages: history,
        system: `You are a helpful assistant for a Regional Manager at Flourish.
    You have access to tools to query their managed locations and search the web.
    When asked about a specific location, first check if it is in their managed list using 'get_my_locations' or search for it.
    If they ask about "surrounding area", use the web search tool to find coffee shops, competitors, or other amenities.
    Be concise and professional.`,
        tools: {
            get_my_locations: tool({
                description: 'Get list of locations managed by the current user.',
                parameters: z.object({}),
                execute: async () => {
                    const locations = await getRegionalLocations();
                    return locations.map(l => ({
                        name: l.name,
                        city: l.city,
                        postcode: l.postcode,
                        footfall: l.footfall,
                        retailSpace: l.retailSpace,
                        tenants: l.tenants.length
                    }));
                },
            }),
            search_web: tool({
                description: 'Search the web for information about surrounding areas, competitors, or general knowledge.',
                parameters: z.object({
                    query: z.string().describe('The search query'),
                }),
                execute: async ({ query }) => {
                    return `(Web Search Simulated) Results for: ${query}. 
          Please note: Live web search requires a separate API key (e.g. Tavily). 
          I will answer based on my internal knowledge of the area around the postcode.`;
                },
            }),
        },
    });

    return stream.toDataStreamResponse();
}
