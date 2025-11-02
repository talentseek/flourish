"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Flourish Assistant Client Component
 * 
 * This component embeds the Flourish Assistant voice widget using Vapi's HTML Script Tag approach.
 * The assistant provides real-time analysis and recommendations for shopping centres.
 */
export function FlourishAssistantClient() {
  const [mounted, setMounted] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vapiInstanceRef = useRef<any>(null);

  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "768a8d5b-23ab-4990-84c3-ef57e68c96cd";
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "7c79f8b2-bffa-46f4-b604-5f8806944a73";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Vapi widget using the HTML Script Tag approach from docs
  useEffect(() => {
    if (!mounted || widgetReady) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="html-script-tag"]');
    if (existingScript) {
      console.log("Vapi script already loaded");
      // Try to initialize if SDK is available
      if ((window as any).vapiSDK) {
        initVapiWidget();
      }
      return;
    }

    // Load the script using the exact approach from Vapi docs
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      console.log("Vapi SDK script loaded");
      initVapiWidget();
    };
    
    script.onerror = () => {
      console.error("Failed to load Vapi SDK script");
      setError("Failed to load widget script. Please check your internet connection and try again.");
    };

    // Insert script before the first script tag (as per docs)
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    function initVapiWidget() {
      // Wait for vapiSDK to be available
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkSDK = setInterval(() => {
        attempts++;
        if ((window as any).vapiSDK) {
          clearInterval(checkSDK);
          try {
            // Initialize widget using the SDK (as per docs)
            vapiInstanceRef.current = (window as any).vapiSDK.run({
              apiKey: publicKey,
              assistant: assistantId,
              config: {
                // Customize button appearance
                buttonStyles: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                },
              },
            });
            setWidgetReady(true);
            console.log("Flourish Assistant widget initialized");
          } catch (err) {
            console.error("Error initializing Vapi widget:", err);
            setError("Failed to initialize widget. Please refresh the page.");
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkSDK);
          console.error("vapiSDK not available after script load");
          setError("Widget SDK failed to load. Please refresh the page.");
        }
      }, 200);
    }
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
      {/* The widget button will be created by Vapi SDK */}
      <div className="relative min-h-[500px] rounded-lg border bg-card">
        {!widgetReady && (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <p className="text-muted-foreground">Loading Flourish Assistant...</p>
          </div>
        )}
        {widgetReady && (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <p className="text-muted-foreground text-sm">
              The Flourish Assistant button should appear in the bottom-right corner. Click it to start a voice conversation.
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

