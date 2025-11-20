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
  email: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
  phone: "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
  web: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700",
  instagram: "bg-pink-50 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-700",
  linkedin: "bg-blue-50 text-blue-800 border-blue-400 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
  whatsapp: "bg-green-50 text-green-800 border-green-400 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
  sms: "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700",
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
              "transition-all duration-300 border-2",
              isSending && "ring-2 ring-primary ring-offset-2 animate-pulse shadow-lg",
              isSent && "bg-muted/50 border-green-200 dark:border-green-800",
              !isSent && !isSending && "border-border shadow-sm"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {r.name}
                  {isSending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {isSent && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </CardTitle>
                <Badge variant={isSent ? "default" : isSending ? "secondary" : "outline"} className="text-sm font-medium">
                  {isSent ? "Sent" : isSending ? "Sending…" : "Prepared"}
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap gap-3 mt-3">
                {r.channels.map((c, j) => {
                  const Icon = channelIcons[c.kind] || Globe
                  return (
                    <div key={j} className="flex items-center gap-2 text-sm text-foreground/80 bg-muted/50 px-3 py-1.5 rounded-md">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{c.value}</span>
                    </div>
                  )
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              
              {/* Channel-specific message previews */}
              <div className="space-y-4">
                <div className="text-base font-semibold text-foreground">Personalized Messages</div>
                <div className="grid gap-4">
                  {allChannels.map((channel, idx) => {
                    const Icon = channelIcons[channel.kind] || Globe
                    const colorClass = channelColors[channel.kind] || "bg-muted text-foreground border-border"
                    const channelSent = isSent
                    const channelSending = isSending && isCurrent

                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "border-2 rounded-lg p-4 transition-all duration-300 shadow-sm",
                          colorClass,
                          channelSending && "ring-2 ring-primary ring-offset-2 animate-pulse",
                          channelSent && "opacity-90"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-md",
                              channel.kind === 'email' && "bg-blue-100 dark:bg-blue-900",
                              channel.kind === 'phone' && "bg-green-100 dark:bg-green-900",
                              channel.kind === 'sms' && "bg-cyan-100 dark:bg-cyan-900",
                              channel.kind === 'whatsapp' && "bg-green-100 dark:bg-green-900",
                              channel.kind === 'linkedin' && "bg-blue-100 dark:bg-blue-900",
                              channel.kind === 'web' && "bg-purple-100 dark:bg-purple-900",
                              channel.kind === 'instagram' && "bg-pink-100 dark:bg-pink-900",
                            )}>
                              <Icon className={cn(
                                "h-5 w-5",
                                channel.kind === 'email' && "text-blue-600 dark:text-blue-300",
                                channel.kind === 'phone' && "text-green-600 dark:text-green-300",
                                channel.kind === 'sms' && "text-cyan-600 dark:text-cyan-300",
                                channel.kind === 'whatsapp' && "text-green-600 dark:text-green-300",
                                channel.kind === 'linkedin' && "text-blue-600 dark:text-blue-300",
                                channel.kind === 'web' && "text-purple-600 dark:text-purple-300",
                                channel.kind === 'instagram' && "text-pink-600 dark:text-pink-300",
                              )} />
                            </div>
                            <span className="text-base font-semibold text-foreground">{channel.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {channelSending && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                            {channelSent && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap bg-background/80 dark:bg-background/60 p-3 rounded-md mt-3 text-foreground border border-border/50">
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
