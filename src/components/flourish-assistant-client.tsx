"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Flourish Assistant Client Component
 * 
 * This component embeds the Flourish Assistant voice widget.
 * The assistant provides real-time analysis and recommendations for shopping centres.
 */
export function FlourishAssistantClient() {
  const [mounted, setMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !mounted || !widgetRef.current) return;

    // Wait a bit for the custom element to be registered, then inject the widget
    const timer = setTimeout(() => {
      if (widgetRef.current && customElements.get('vapi-widget')) {
        widgetRef.current.innerHTML = `
          <vapi-widget
            assistant-id="${assistantId}"
            public-key="${publicKey}"
            mode="voice"
            theme="light"
            position="bottom-right"
            size="full"
            border-radius="medium"
            button-base-color="hsl(var(--primary))"
            button-accent-color="hsl(var(--primary-foreground))"
            main-label="Flourish Assistant"
            start-button-text="Start Conversation"
            end-button-text="End Conversation"
            require-consent="false"
            show-transcript="true"
          ></vapi-widget>
        `;
      } else {
        console.warn("vapi-widget custom element not found after script load");
        setError("Widget failed to initialize. Please refresh the page.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [scriptLoaded, mounted, assistantId, publicKey]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Load Widget Script */}
      <Script
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Flourish Assistant script loaded");
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Flourish Assistant script:", e);
          setError("Failed to load widget script. Please check your internet connection and try again.");
        }}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voice Assistant Widget */}
      <div 
        ref={widgetRef}
        className="relative min-h-[500px] rounded-lg border bg-card"
      >
        {!scriptLoaded && (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <p className="text-muted-foreground">Loading Flourish Assistant...</p>
          </div>
        )}
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

