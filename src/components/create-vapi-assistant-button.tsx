"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function CreateVapiAssistantButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    setIsCreated(false);

    try {
      const response = await fetch("/api/vapi/create-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to create assistant: ${response.statusText}`);
      }

      setIsCreated(true);
      toast.success("Flourish Assistant created successfully!", {
        description: `Assistant ID: ${data.assistant?.id || "N/A"}`,
      });
    } catch (error) {
      console.error("Error creating assistant:", error);
      toast.error("Failed to create assistant", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isCreating || isCreated}
      className="w-full"
      variant={isCreated ? "outline" : "default"}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Assistant...
        </>
      ) : isCreated ? (
        <>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Assistant Created
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          Create Vapi Assistant
        </>
      )}
    </Button>
  );
}

