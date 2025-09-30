"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export function PrintButtons() {
  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <div className="flex gap-2">
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


