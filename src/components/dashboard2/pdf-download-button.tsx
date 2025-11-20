"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { Location } from "@/types/location"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface PDFDownloadButtonProps {
  location: Location
  contentRef?: React.RefObject<HTMLDivElement>
}

export function PDFDownloadButton({ location, contentRef }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Function to convert oklch to hex (approximate conversion)
  const oklchToHex = (oklch: string): string => {
    // Map known oklch values to hex
    if (oklch.includes('0.9689 0.0042 56.3749')) return '#F7F4F2' // background
    if (oklch.includes('0.9442 0.1774 116.4604')) return '#e8f5e9' // destructive/chart-1
    if (oklch.includes('0.4107 0.0077 75.3282')) return '#4D4A46' // destructive-foreground/chart-2
    if (oklch.includes('0.7011 0.0167 67.5508')) return '#A69D94' // chart-3
    if (oklch.includes('0.7690 0.0143 60.5087')) return '#BBB2AB' // chart-4
    if (oklch.includes('0.8817 0.0027 106.4549')) return '#D8D8D6' // chart-5
    return '#F7F4F2' // fallback
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    let styleOverride: HTMLStyleElement | null = null
    
    try {
      // Get the content element to convert to PDF
      const element = contentRef?.current || document.getElementById('location-content')
      
      if (!element) {
        console.error('Content element not found')
        alert('Could not find content to export. Please refresh the page and try again.')
        setIsGenerating(false)
        return
      }

      // Create a style element to override oklch CSS variables with RGB equivalents
      styleOverride = document.createElement('style')
      styleOverride.id = 'pdf-export-override'
      styleOverride.textContent = `
        :root {
          --background: #F7F4F2 !important; /* White Beige */
          --destructive: #e8f5e9 !important; /* Light green equivalent */
          --destructive-foreground: #4D4A46 !important; /* Fossil Grey */
          --chart-1: #e8f5e9 !important;
          --chart-2: #4D4A46 !important;
          --chart-3: #A69D94 !important; /* Stone Grey */
          --chart-4: #BBB2AB !important; /* Warm Grey */
          --chart-5: #D8D8D6 !important; /* Pearl Silver */
          --sidebar: #4D4A46 !important;
          --sidebar-foreground: #F7F4F2 !important;
          --sidebar-primary: #E6FB60 !important; /* Lime Green */
          --sidebar-primary-foreground: #4D4A46 !important;
          --sidebar-accent: #D8D8D6 !important;
          --sidebar-accent-foreground: #4D4A46 !important;
          --sidebar-border: #A69D94 !important;
          --sidebar-ring: #E6FB60 !important;
        }
      `
      document.head.appendChild(styleOverride)

      // Wait a bit to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100))

      // Wait a bit to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 500))

      // Scroll to top to ensure we capture the full content
      const originalScrollY = window.scrollY
      window.scrollTo(0, 0)
      await new Promise(resolve => setTimeout(resolve, 100))

      try {
        // Create a hidden iframe to render the content without oklch issues
        const iframe = document.createElement('iframe')
        iframe.style.position = 'absolute'
        iframe.style.left = '-9999px'
        iframe.style.width = `${element.scrollWidth}px`
        iframe.style.height = `${element.scrollHeight}px`
        document.body.appendChild(iframe)

        // Wait for iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve
          iframe.src = 'about:blank'
        })

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (!iframeDoc) {
          throw new Error('Failed to access iframe document')
        }

        // Clone the element and all its styles
        const clonedElement = element.cloneNode(true) as HTMLElement
        
        // Get all stylesheets from the main document
        const stylesheets: string[] = []
        for (let i = 0; i < document.styleSheets.length; i++) {
          try {
            const sheet = document.styleSheets[i]
            if (sheet.cssRules) {
              let cssText = ''
              for (let j = 0; j < sheet.cssRules.length; j++) {
                cssText += sheet.cssRules[j].cssText + '\n'
              }
              // Replace oklch with hex
              cssText = cssText.replace(/oklch\([^)]+\)/g, (match) => oklchToHex(match))
              stylesheets.push(cssText)
            }
          } catch (e) {
            // Cross-origin stylesheet, skip
          }
        }

        // Create a style element with all converted styles
        const styleEl = iframeDoc.createElement('style')
        styleEl.textContent = stylesheets.join('\n') + `
          :root {
            --background: #F7F4F2 !important;
            --destructive: #e8f5e9 !important;
            --destructive-foreground: #4D4A46 !important;
            --chart-1: #e8f5e9 !important;
            --chart-2: #4D4A46 !important;
            --chart-3: #A69D94 !important;
            --chart-4: #BBB2AB !important;
            --chart-5: #D8D8D6 !important;
            --sidebar: #4D4A46 !important;
            --sidebar-foreground: #F7F4F2 !important;
            --sidebar-primary: #E6FB60 !important;
            --sidebar-primary-foreground: #4D4A46 !important;
            --sidebar-accent: #D8D8D6 !important;
            --sidebar-accent-foreground: #4D4A46 !important;
            --sidebar-border: #A69D94 !important;
            --sidebar-ring: #E6FB60 !important;
          }
          body {
            margin: 0;
            padding: 20px;
            background: white;
          }
        `
        iframeDoc.head.appendChild(styleEl)
        iframeDoc.body.appendChild(clonedElement)

        // Wait for styles to apply
        await new Promise(resolve => setTimeout(resolve, 500))

        // Now capture from iframe
        const canvas = await html2canvas(iframeDoc.body, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight,
        })

        // Clean up iframe
        document.body.removeChild(iframe)

        // Remove style override
        if (styleOverride && styleOverride.parentNode) {
          styleOverride.parentNode.removeChild(styleOverride)
        }

        // Restore scroll position
        window.scrollTo(0, originalScrollY)

        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas generation failed - empty canvas')
        }

        // Calculate PDF dimensions
        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png', 0.95)
        
        if (!imgData || imgData === 'data:,') {
          throw new Error('Failed to convert canvas to image data')
        }

        // If content fits on one page
        if (imgHeight <= pageHeight) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        } else {
          // Content spans multiple pages
          let heightLeft = imgHeight
          let position = 0

          // Add first page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight

          // Add additional pages
          while (heightLeft > 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
          }
        }

        // Save PDF
        const fileName = `${location.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`
        pdf.save(fileName)
      } catch (canvasError) {
        // Remove style override on error
        if (styleOverride && styleOverride.parentNode) {
          styleOverride.parentNode.removeChild(styleOverride)
        }
        // Restore scroll position on error
        window.scrollTo(0, originalScrollY)
        throw canvasError
      }
    } catch (error) {
      // Ensure style override is removed
      if (styleOverride && styleOverride.parentNode) {
        styleOverride.parentNode.removeChild(styleOverride)
      }
      console.error('Error generating PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate PDF: ${errorMessage}. Please try again or contact support if the issue persists.`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  )
}

