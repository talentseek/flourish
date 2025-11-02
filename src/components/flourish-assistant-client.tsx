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
  const [widgetReady, setWidgetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize widget after script loads
  useEffect(() => {
    if (!scriptLoaded || !mounted || !widgetRef.current || widgetReady) return;

    // Wait for custom element to be registered (with retries)
    let attempts = 0;
    const maxAttempts = 30; // 6 seconds total (longer wait)
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Check if custom element is registered
      if (typeof window !== 'undefined' && customElements.get('vapi-widget')) {
        clearInterval(checkInterval);
        
        // Use dangerouslySetInnerHTML to avoid React conflicts
        if (widgetRef.current) {
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
          setWidgetReady(true);
          console.log("Flourish Assistant widget initialized");
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error("vapi-widget custom element not found after script load");
        setError("Widget failed to initialize. The script may not be compatible or there may be a browser compatibility issue.");
      }
    }, 200);

    return () => clearInterval(checkInterval);
  }, [scriptLoaded, mounted, assistantId, publicKey, widgetReady]);

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
        id="vapi-widget-script"
        src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("Flourish Assistant script loaded");
          // Give the script a moment to register the custom element
          setTimeout(() => {
            setScriptLoaded(true);
          }, 500);
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
        {!widgetReady && (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <p className="text-muted-foreground">
              {scriptLoaded ? "Initializing Flourish Assistant..." : "Loading Flourish Assistant..."}
            </p>
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

