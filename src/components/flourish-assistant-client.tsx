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
  // Vapi widget should be added to document.body, not inside a container
  useEffect(() => {
    if (!mounted || widgetAdded || !assistantId || !publicKey) return;

    // Check if widget already exists
    if (document.querySelector('vapi-widget')) {
      console.log("✅ Widget already exists in DOM");
      setWidgetAdded(true);
      return;
    }

    // Add widget element to document.body (Vapi requirement)
    const timer = setTimeout(() => {
      const existingWidget = document.querySelector('vapi-widget');
      if (!existingWidget) {
        const widget = document.createElement('vapi-widget');
        widget.setAttribute('assistant-id', assistantId);
        widget.setAttribute('public-key', publicKey);
        widget.setAttribute('mode', 'voice');
        widget.setAttribute('theme', 'light');
        
        // Add to body, not container (Vapi widget needs to be at root level)
        document.body.appendChild(widget);
        setWidgetAdded(true);
        console.log("✅ Widget element added to document.body:", { assistantId, hasPublicKey: !!publicKey });
      } else {
        setWidgetAdded(true);
      }
    }, 100);

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
              const widget = document.querySelector('vapi-widget');
              if (widget) {
                console.log("✅ Widget element found by script");
                // Check if widget has any errors
                const widgetElement = widget as any;
                if (widgetElement.error) {
                  console.error("❌ Widget error:", widgetElement.error);
                  setError(`Widget error: ${widgetElement.error}`);
                } else {
                  console.log("✅ Widget initialized successfully");
                }
              } else {
                console.warn("⚠️ Widget element not found after script load");
                setError("Widget element not found. Please check browser console for errors.");
              }
            }, 1000);
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
      {/* Note: Widget is added to document.body, not this container */}
      {(!assistantId || !publicKey) ? (
        <Alert variant="destructive">
          <AlertDescription>
            Vapi configuration missing. Please set NEXT_PUBLIC_VAPI_ASSISTANT_ID and NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variables.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="relative min-h-[500px] rounded-lg border bg-card flex items-center justify-center">
          {!scriptLoaded ? (
            <p className="text-muted-foreground">Loading Flourish Assistant...</p>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Flourish Assistant is ready!</p>
              <p className="text-xs text-muted-foreground">Look for the widget button in the bottom-right corner.</p>
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

