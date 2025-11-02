"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Flourish Assistant Client Component
 * 
 * This component embeds the Flourish Assistant voice widget.
 * The assistant provides real-time analysis and recommendations for shopping centres.
 */
export function FlourishAssistantClient() {
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  useEffect(() => {
    if (!scriptLoaded || !widgetContainerRef.current) return;

    // Create the widget element programmatically after script loads
    const container = widgetContainerRef.current;
    
    // Clear any existing widget
    container.innerHTML = '';

    // Create the vapi-widget element
    const widget = document.createElement('vapi-widget');
    widget.setAttribute('assistant-id', assistantId);
    widget.setAttribute('public-key', publicKey);
    widget.setAttribute('mode', 'voice');
    widget.setAttribute('theme', 'light');
    widget.setAttribute('position', 'bottom-right');
    widget.setAttribute('size', 'full');
    widget.setAttribute('border-radius', 'medium');
    widget.setAttribute('button-base-color', 'hsl(var(--primary))');
    widget.setAttribute('button-accent-color', 'hsl(var(--primary-foreground))');
    widget.setAttribute('main-label', 'Flourish Assistant');
    widget.setAttribute('start-button-text', 'Start Conversation');
    widget.setAttribute('end-button-text', 'End Conversation');
    widget.setAttribute('require-consent', 'false');
    widget.setAttribute('show-transcript', 'true');

    container.appendChild(widget);
  }, [scriptLoaded, assistantId, publicKey]);

  return (
    <div className="space-y-4">
      {/* Load Widget Script */}
      <Script
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
        strategy="lazyOnload"
        onLoad={() => {
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Flourish Assistant script:", e);
        }}
      />

      {/* Voice Assistant Widget Container */}
      <div 
        ref={widgetContainerRef}
        className="relative min-h-[500px] rounded-lg border bg-card"
      />

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

