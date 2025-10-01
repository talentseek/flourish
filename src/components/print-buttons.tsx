"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { toast } from "sonner"

export function PrintButtons() {
  function handlePrint() {
    if (typeof window !== "undefined") {
      // Show helpful tip
      toast.info("Tip: In the print dialog, select 'Save as PDF' and ensure 'Background graphics' is enabled for best results.")
      
      // Small delay to let toast appear before print dialog
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={handlePrint}>
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button onClick={handlePrint}>
        <FileText className="h-4 w-4 mr-2" />
        Print Report
      </Button>
    </div>
  )
}


