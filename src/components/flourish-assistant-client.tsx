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
  const [widgetAdded, setWidgetAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  // Validate required props
  if (!assistantId || !publicKey) {
    console.error("Missing Vapi configuration:", { assistantId: !!assistantId, publicKey: !!publicKey });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // CRITICAL: Add widget element to DOM IMMEDIATELY when component mounts
  // This MUST happen before the script loads
  useEffect(() => {
    if (!mounted || widgetAdded || !assistantId || !publicKey) return;

    // Add widget element to DOM immediately
    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (widgetRef.current && !widgetRef.current.querySelector('vapi-widget')) {
        const widget = document.createElement('vapi-widget');
        widget.setAttribute('assistant-id', assistantId);
        widget.setAttribute('public-key', publicKey);
        // Simplified attributes - only essential ones
        widget.setAttribute('mode', 'voice');
        widget.setAttribute('theme', 'light');
        
        widgetRef.current.appendChild(widget);
        setWidgetAdded(true);
        console.log("✅ Widget element added to DOM:", { assistantId, hasPublicKey: !!publicKey });
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [mounted, assistantId, publicKey, widgetAdded]);

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
      {/* Use afterInteractive to ensure widget is added first */}
      {mounted && widgetAdded && (
        <Script
          id="vapi-widget-script"
          src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
          strategy="afterInteractive"
          async
          onLoad={() => {
            console.log("✅ Vapi widget script loaded");
            setScriptLoaded(true);
            
            // Wait a bit for widget to initialize
            setTimeout(() => {
              const widget = widgetRef.current?.querySelector('vapi-widget');
              if (widget) {
                console.log("✅ Widget element found by script");
                // Check if widget has any errors
                const widgetElement = widget as any;
                if (widgetElement.error) {
                  console.error("❌ Widget error:", widgetElement.error);
                  setError(`Widget error: ${widgetElement.error}`);
                }
              } else {
                console.warn("⚠️ Widget element not found after script load");
              }
            }, 500);
          }}
          onError={(e) => {
            console.error("❌ Failed to load Vapi widget script:", e);
            setError("Failed to load widget script. Please check your internet connection and try again.");
          }}
        />
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voice Assistant Widget Container */}
      {/* Widget element is rendered BEFORE script loads (critical for Vapi) */}
      {(!assistantId || !publicKey) ? (
        <Alert variant="destructive">
          <AlertDescription>
            Vapi configuration missing. Please set NEXT_PUBLIC_VAPI_ASSISTANT_ID and NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variables.
          </AlertDescription>
        </Alert>
      ) : (
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
      )}

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

