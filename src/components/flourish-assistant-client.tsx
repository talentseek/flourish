"use client";

import { useEffect, useState, useRef } from "react";
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
  const [widgetReady, setWidgetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load script and initialize widget
  useEffect(() => {
    if (!mounted || !widgetContainerRef.current || widgetReady) return;

    // Check if script already exists
    let script = document.querySelector('script[src*="widget.umd.js"]') as HTMLScriptElement;
    
    if (!script) {
      // Create and inject script tag in head (more reliable for custom elements)
      script = document.createElement('script');
      script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
      script.async = false; // Load synchronously to ensure it executes
      script.type = 'text/javascript';
      document.head.appendChild(script);
    }

    const initWidget = () => {
      if (!widgetContainerRef.current || widgetReady) return;

      // Check if custom element is registered
      if (customElements.get('vapi-widget')) {
        // Clear container
        widgetContainerRef.current.innerHTML = '';
        
        // Create widget element
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

        widgetContainerRef.current.appendChild(widget);
        setWidgetReady(true);
        console.log("Flourish Assistant widget initialized");
      }
    };

    // Set up load handler
    script.onload = () => {
      console.log("Flourish Assistant script loaded");
      // Wait for custom element registration
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkRegistration = setInterval(() => {
        attempts++;
        if (customElements.get('vapi-widget')) {
          console.log("vapi-widget custom element registered");
          clearInterval(checkRegistration);
          initWidget();
        } else if (attempts >= maxAttempts) {
          console.error("Custom element not registered after script load");
          clearInterval(checkRegistration);
          setError("Widget failed to initialize. The script may not be compatible with this browser. Please try refreshing the page.");
        }
      }, 200);
    };
    
    // If script was already loaded, try to init immediately
    if (script.getAttribute('data-loaded') === 'true') {
      setTimeout(initWidget, 100);
    }

    script.onerror = () => {
      console.error("Failed to load Flourish Assistant script");
      setError("Failed to load widget script. Please check your internet connection and try again.");
    };
  }, [mounted, assistantId, publicKey, widgetReady]);

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
        ref={widgetContainerRef}
        className="relative min-h-[500px] rounded-lg border bg-card"
      >
        {!widgetReady && (
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

