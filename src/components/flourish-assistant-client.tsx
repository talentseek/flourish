"use client";

import { useEffect, useState } from "react";
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

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load script directly in the document (like the docs recommend)
  useEffect(() => {
    if (!mounted) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="widget.umd.js"]');
    if (existingScript) {
      console.log("Widget script already loaded");
      setScriptLoaded(true);
      return;
    }

    // Create and inject script tag directly
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      console.log("Flourish Assistant script loaded");
      // Wait a moment for custom element registration
      setTimeout(() => {
        if (customElements.get('vapi-widget')) {
          setScriptLoaded(true);
        } else {
          console.warn("Script loaded but custom element not registered yet");
          // Still set as loaded, widget element will handle it
          setScriptLoaded(true);
        }
      }, 300);
    };
    
    script.onerror = () => {
      console.error("Failed to load Flourish Assistant script");
      setError("Failed to load widget script. Please check your internet connection and try again.");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      const scriptToRemove = document.querySelector('script[src*="widget.umd.js"]');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
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
      <div 
        className="relative min-h-[500px] rounded-lg border bg-card"
        dangerouslySetInnerHTML={
          scriptLoaded
            ? {
                __html: `
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
                `,
              }
            : undefined
        }
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

