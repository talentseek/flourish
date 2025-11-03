"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteVapiAssistantButton() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the Flourish Assistant and all its tools? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/vapi/delete-assistant", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete assistant: ${response.statusText}`);
      }

      toast.success("Flourish Assistant deleted successfully!", {
        description: data.message,
      });
    } catch (error) {
      console.error("Error deleting assistant:", error);
      toast.error("Failed to delete assistant", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting}
      variant="destructive"
      className="w-full"
    >
      {isDeleting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Deleting Assistant...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Vapi Assistant
        </>
      )}
    </Button>
  );
}

