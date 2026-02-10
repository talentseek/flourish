import { prisma } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

// Palace Shopping coordinates (Enfield)
const PALACE_LAT = 51.6518;
const PALACE_LNG = -0.0577;
const RADIUS_MILES = 5;
const RADIUS_KM = RADIUS_MILES * 1.60934;

// Approximate bounding box for 5-mile radius
const LAT_OFFSET = RADIUS_KM / 111;
const LNG_OFFSET = RADIUS_KM / (111 * Math.cos((PALACE_LAT * Math.PI) / 180));

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Fetch Palace Shopping + nearby locations within ~5 mile radius
    const locations = await prisma.location.findMany({
        where: {
            latitude: {
                gte: PALACE_LAT - LAT_OFFSET,
                lte: PALACE_LAT + LAT_OFFSET,
            },
            longitude: {
                gte: PALACE_LNG - LNG_OFFSET,
                lte: PALACE_LNG + LNG_OFFSET,
            },
        },
        select: {
            name: true,
            city: true,
            type: true,
            postcode: true,
            footfall: true,
            retailSpace: true,
            numberOfStores: true,
            parkingSpaces: true,
            website: true,
            vacancy: true,
            googleRating: true,
            googleReviews: true,
            owner: true,
            management: true,
            tenants: {
                select: { name: true, category: true }
            }
        },
    });

    const locationContext = locations.map((l) => {
        const tenantsByCategory: Record<string, string[]> = {};
        l.tenants.forEach(t => {
            const cat = t.category || 'Uncategorised';
            if (!tenantsByCategory[cat]) tenantsByCategory[cat] = [];
            tenantsByCategory[cat].push(t.name);
        });

        const categoryBreakdown = Object.entries(tenantsByCategory)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([cat, tenants]) => `  ${cat}: ${tenants.slice(0, 8).join(', ')}${tenants.length > 8 ? ` (+${tenants.length - 8} more)` : ''}`)
            .join('\n');

        return `📍 ${l.name} (${l.city}, ${l.postcode || 'N/A'}) — ${l.type || 'Retail'}
  Owner: ${l.owner || 'N/A'} | Manager: ${l.management || 'N/A'}
  Stores: ${l.numberOfStores || 'N/A'} | Footfall: ${l.footfall ? `${(l.footfall / 1000000).toFixed(1)}m` : 'N/A'}
  Vacancy: ${l.vacancy != null ? `${Number(l.vacancy)}%` : 'N/A'} | Parking: ${l.parkingSpaces?.toLocaleString() || 'N/A'}
  Google: ${l.googleRating ? `${Number(l.googleRating)}/5` : 'N/A'} (${l.googleReviews || 0} reviews)
  Total Tenants: ${l.tenants.length}
${categoryBreakdown ? `  Category Breakdown:\n${categoryBreakdown}` : ''}`;
    }).join('\n\n');

    const systemPrompt = `You are Flourish AI, a retail intelligence assistant for the RivingtonHark portfolio demo.

Your focus area is Palace Shopping & Exchange (Enfield) and all retail locations within a 5-mile radius.

LOCATION DATA (${locations.length} locations in range):

${locationContext}

INSTRUCTIONS:
- You are helping demonstrate Flourish to RivingtonHark, a property management company
- Be enthusiastic but professional — you're showcasing the platform's intelligence
- Reference specific data when answering questions (tenant names, vacancy rates, footfall)
- If asked about gap analysis, identify missing tenant categories by comparing to the wider area
- If asked about competition, compare Palace Shopping's tenant mix, rating, and footfall with nearby centres
- Highlight insights proactively (e.g., "Palace Shopping has a particularly strong Food & Drink offering but could benefit from more Health & Beauty tenants")
- Keep responses concise (2-4 paragraphs max)
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
