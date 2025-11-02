"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dynamically import the Vapi widget to avoid SSR issues
const VapiWidget = dynamic(
  () => import('@vapi-ai/client-sdk-react').then((mod) => mod.VapiWidget),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading Flourish Assistant...</p>
      </div>
    )
  }
);

/**
 * Flourish Assistant Client Component
 * 
 * This component embeds the Flourish Assistant voice widget.
 * The assistant provides real-time analysis and recommendations for shopping centres.
 */
export function FlourishAssistantClient() {
  const [error, setError] = useState<string | null>(null);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  if (!assistantId || !publicKey) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Assistant configuration missing. Please set NEXT_PUBLIC_VAPI_ASSISTANT_ID and NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voice Assistant Widget */}
      <div className="relative min-h-[500px] rounded-lg border bg-card">
        <VapiWidget
          publicKey={publicKey}
          assistantId={assistantId}
          mode="voice"
          theme="light"
          position="bottom-right"
          size="full"
          borderRadius="medium"
          buttonBaseColor="hsl(var(--primary))"
          buttonAccentColor="hsl(var(--primary-foreground))"
          mainLabel="Flourish Assistant"
          startButtonText="Start Conversation"
          endButtonText="End Conversation"
          requireConsent={false}
          showTranscript={true}
        />
      </div>

      {/* Example Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Example Questions</CardTitle>
          <CardDescription>
            Try asking the assistant these questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Badge variant="outline" className="mt-0.5">Q</Badge>
              <span className="text-muted-foreground">
                "What recommendations do you have for Manchester Arndale?"
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Badge variant="outline" className="mt-0.5">Q</Badge>
              <span className="text-muted-foreground">
                "Compare Bluewater with nearby competitors"
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Badge variant="outline" className="mt-0.5">Q</Badge>
              <span className="text-muted-foreground">
                "What tenant categories are missing in my area?"
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Badge variant="outline" className="mt-0.5">Q</Badge>
              <span className="text-muted-foreground">
                "Tell me more about The Trafford Centre"
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

