"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RefreshMetricsButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/enrichment/compute", {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the page to show new data
        router.refresh();
      } else {
        console.error("Failed to refresh metrics");
        alert("Failed to refresh metrics. Please try again.");
      }
    } catch (error) {
      console.error("Error refreshing metrics:", error);
      alert("Error refreshing metrics. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh Metrics"}
    </Button>
  );
}

