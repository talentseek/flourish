"use client";

import { useState, useEffect } from "react";
import { Mic, Phone, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@clerk/nextjs";

/**
 * Flourish Assistant Client Component
 * 
 * This component provides the UI for interacting with the Vapi voice assistant.
 * Currently displays setup instructions. Once Vapi widget is configured, embed it here.
 */
export function FlourishAssistantClient() {
  const { user, isLoaded } = useUser();
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for Vapi widget integration
  // Once Vapi assistant is configured, embed the widget here
  // Example: <VapiWidget assistantId="your-assistant-id" />

  const handleStartCall = () => {
    setIsCalling(true);
    setError(null);
    
    // TODO: Initialize Vapi call
    // This will be implemented once Vapi assistant is configured
    setTimeout(() => {
      setIsCalling(false);
      setError("Vapi assistant not yet configured. Please set up your assistant in the Vapi dashboard.");
    }, 1000);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    // TODO: End Vapi call
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Call Interface */}
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
        <div className="flex flex-col items-center gap-4">
          <div className={`p-6 rounded-full ${isCalling ? 'bg-red-500/10' : 'bg-primary/10'}`}>
            {isCalling ? (
              <PhoneOff className="h-12 w-12 text-red-500" />
            ) : (
              <Mic className="h-12 w-12 text-primary" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {isCalling ? "Call in Progress" : "Start Voice Assistant"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isCalling
                ? "Your call with Flourish Assistant is active. Ask your questions!"
                : "Click the button below to start a voice conversation with your AI assistant."}
            </p>
          </div>

          <Button
            size="lg"
            onClick={isCalling ? handleEndCall : handleStartCall}
            disabled={!user}
            className="min-w-[200px]"
            variant={isCalling ? "destructive" : "default"}
          >
            {isCalling ? (
              <>
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Start Call
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Setup Instructions */}
      {!isCalling && (
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Setup Required</p>
              <p className="text-sm">
                To enable voice calls, configure your Vapi assistant in the dashboard and embed the widget here.
                The assistant will have access to all Flourish analytics APIs to provide recommendations.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Function endpoints available:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>/api/vapi/location-search</li>
                  <li>/api/vapi/location-details</li>
                  <li>/api/vapi/local-recommendations</li>
                  <li>/api/vapi/tenant-gap-analysis</li>
                  <li>/api/vapi/nearby-competitors</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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

