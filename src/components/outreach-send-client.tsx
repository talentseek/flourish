"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Globe, Instagram, Linkedin, MessageSquare, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type OutreachChannel = { kind: string; icon: string; label: string; value: string; href?: string }
export type OutreachResult = { name: string; channels: OutreachChannel[]; message: string }

const channelIcons: Record<string, any> = {
  email: Mail,
  phone: Phone,
  web: Globe,
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: MessageSquare,
  sms: MessageSquare,
}

const channelColors: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-600 border-blue-200",
  phone: "bg-green-500/10 text-green-600 border-green-200",
  web: "bg-purple-500/10 text-purple-600 border-purple-200",
  instagram: "bg-pink-500/10 text-pink-600 border-pink-200",
  linkedin: "bg-blue-600/10 text-blue-700 border-blue-300",
  whatsapp: "bg-green-600/10 text-green-700 border-green-300",
  sms: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
}

export function OutreachSendClient({ results }: { results: OutreachResult[] }) {
  const [sent, setSent] = useState<Record<number, boolean>>({})
  const [sending, setSending] = useState<Record<number, boolean>>({})
  const [autoSending, setAutoSending] = useState(false)
  const [currentSendingIndex, setCurrentSendingIndex] = useState<number | null>(null)

  // Auto-send all messages with animation
  useEffect(() => {
    if (results.length > 0 && !autoSending) {
      setAutoSending(true)
      // Start auto-sending after a brief delay
      setTimeout(() => {
        results.forEach((_, i) => {
          setTimeout(() => {
            setCurrentSendingIndex(i)
            setSending((s) => ({ ...s, [i]: true }))
            setTimeout(() => {
              setSending((s) => ({ ...s, [i]: false }))
              setSent((s) => ({ ...s, [i]: true }))
              setCurrentSendingIndex(null)
            }, 1200)
          }, i * 800)
        })
      }, 500)
    }
  }, [results, autoSending])

  const sendOne = async (idx: number) => {
    setSending((s) => ({ ...s, [idx]: true }))
    await new Promise((r) => setTimeout(r, 1200))
    setSending((s) => ({ ...s, [idx]: false }))
    setSent((s) => ({ ...s, [idx]: true }))
  }

  const getMessagePreview = (channel: OutreachChannel, message: string) => {
    if (channel.kind === 'sms' || channel.kind === 'whatsapp') {
      return message.substring(0, 100) + (message.length > 100 ? '...' : '')
    }
    return message
  }

  return (
    <div className="space-y-4">
      {results.map((r, i) => {
        const isSending = sending[i]
        const isSent = sent[i]
        const isCurrent = currentSendingIndex === i

        // Determine which channels to show based on available channels
        const emailChannel = r.channels.find(c => c.kind === 'email')
        const linkedinChannel = r.channels.find(c => c.kind === 'linkedin')
        const phoneChannel = r.channels.find(c => c.kind === 'phone')
        
        // Add SMS and WhatsApp if phone exists
        const smsChannel = phoneChannel ? { kind: 'sms', icon: 'sms', label: 'SMS', value: phoneChannel.value } : null
        const whatsappChannel = phoneChannel ? { kind: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp', value: phoneChannel.value } : null

        const allChannels = [
          emailChannel,
          smsChannel,
          whatsappChannel,
          linkedinChannel,
        ].filter(Boolean) as OutreachChannel[]

        return (
          <Card 
            key={i} 
            className={cn(
              "transition-all duration-300",
              isSending && "ring-2 ring-primary animate-pulse",
              isSent && "bg-muted/30"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {r.name}
                  {isSending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {isSent && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </CardTitle>
                <Badge variant={isSent ? "default" : isSending ? "secondary" : "outline"}>
                  {isSent ? "Sent" : isSending ? "Sending…" : "Prepared"}
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap gap-2 mt-2">
                {r.channels.map((c, j) => {
                  const Icon = channelIcons[c.kind] || Globe
                  return (
                    <div key={j} className="flex items-center gap-1.5 text-xs">
                      <Icon className="h-3 w-3" />
                      <span>{c.value}</span>
                    </div>
                  )
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              
              {/* Channel-specific message previews */}
              <div className="space-y-3">
                <div className="text-sm font-medium">Personalized Messages</div>
                <div className="grid gap-3">
                  {allChannels.map((channel, idx) => {
                    const Icon = channelIcons[channel.kind] || Globe
                    const colorClass = channelColors[channel.kind] || "bg-muted"
                    const channelSent = isSent
                    const channelSending = isSending && isCurrent

                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "border rounded-lg p-3 transition-all duration-300",
                          colorClass,
                          channelSending && "ring-2 ring-primary animate-pulse",
                          channelSent && "opacity-75"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{channel.label}</span>
                          </div>
                          {channelSending && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {channelSent && (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          )}
                        </div>
                        <div className="text-xs whitespace-pre-wrap bg-background/50 p-2 rounded mt-2">
                          {getMessagePreview(channel, r.message)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
