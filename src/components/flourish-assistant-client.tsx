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
 * Following Vapi docs: widget element MUST be in DOM BEFORE script loads.
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

  // Render widget element FIRST, then load script (as per Vapi docs)
  useEffect(() => {
    if (!mounted || !widgetRef.current || scriptLoaded) return;

    // Inject widget element into DOM BEFORE script loads
    // This is critical - script looks for existing vapi-widget elements
    if (widgetRef.current && !widgetRef.current.querySelector('vapi-widget')) {
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
      
      widgetRef.current.appendChild(widget);
      console.log("Widget element added to DOM");
    }
  }, [mounted, assistantId, publicKey, scriptLoaded]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Load script AFTER widget element is in DOM */}
      <Script
        id="vapi-widget-script"
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
        strategy="lazyOnload"
        async
        onLoad={() => {
          console.log("Vapi widget script loaded");
          setScriptLoaded(true);
          // Script will automatically find and initialize the vapi-widget element
        }}
        onError={(e) => {
          console.error("Failed to load Vapi widget script:", e);
          setError("Failed to load widget script. Please check your internet connection and try again.");
        }}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voice Assistant Widget Container */}
      {/* Widget element is rendered BEFORE script loads (critical for Vapi) */}
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

