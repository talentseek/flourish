'use client';

import { useChat } from 'ai/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from 'ai';

export default function AiChat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat', // We will need to create this route handler or adjust logic to use Server Action in direct hook if using Vercel AI SDK 3.3+ "useChat" with server action
        // BUT standard useChat expects an API route by default.
        // Let's create an API route handler `src/app/api/chat/route.ts` instead of just a server action file OR configure useChat to use the action.
        // Newer AI SDK supports server actions directly but useChat often defaults to fetch.
        // Let's create the API route to be safe and standard.
    });

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Regional Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center mt-10">
                                Ask me about your locations or the surrounding area.
                            </p>
                        )}
                        {messages.map((m: Message) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-muted text-foreground'
                                        }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted text-foreground rounded-lg px-4 py-2 text-sm animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about footfall, trends, or competitors..."
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        Send
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
