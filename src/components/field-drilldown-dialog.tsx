"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface FieldDrilldownDialogProps {
  fieldStats: Record<string, { filled: number; empty: number }>;
}

export function FieldDrilldownDialog({ fieldStats }: FieldDrilldownDialogProps) {
  // Sort by most empty fields first
  const sortedFields = Object.entries(fieldStats).sort(
    (a, b) => b[1].empty - a[1].empty
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Field Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Field-Level Enrichment</DialogTitle>
          <DialogDescription>
            Detailed breakdown of data completeness for each field across all locations
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
          {sortedFields.map(([field, stats]) => {
            const total = stats.filled + stats.empty;
            const percentage = total > 0 ? (stats.filled / total) * 100 : 0;

            return (
              <div
                key={field}
                className="flex justify-between items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-mono min-w-[200px]">{field}</span>
                <div className="flex items-center gap-3 flex-1">
                  <Progress value={percentage} className="flex-1" />
                  <div className="flex flex-col items-end min-w-[80px]">
                    <span className="text-xs font-medium">
                      {stats.filled.toLocaleString()}/{total.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

