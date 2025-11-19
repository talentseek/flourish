"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'no-answer' | 'appointment-booked'

const mockTranscript = [
  { speaker: 'agent', text: "Hi, is that Sarah?", delay: 500 },
  { speaker: 'owner', text: "Yes, speaking.", delay: 1500 },
  { speaker: 'agent', text: "Hi Sarah, my name's Charlene, calling on behalf of the Flourish leasing team at the Pentagon Shopping Centre in Chatham. How are you today?", delay: 2000 },
  { speaker: 'owner', text: "I'm good, thanks.", delay: 1500 },
  { speaker: 'agent', text: "We're reviewing our fast-casual dining offer at the centre, and your restaurant on the High Street came up in our data as one of the strongest local operators in that category and a perfect fit for our leasing strategy.", delay: 3000 },
  { speaker: 'owner', text: "Okay… right.", delay: 1500 },
  { speaker: 'agent', text: "Don't worry, this isn't a sales call. We've identified a gap for good-quality, fast-casual dining at Pentagon compared with other centres in the area, and we're exploring whether an additional site could be interesting for you over the next 6 to 18 months. We think your business is great and would love to have a chat.\n\nAll I'd like to do today is see if you'd be open to a short, 15–20 minute call with the leasing manager, Michelle, who can walk you through the numbers and options.", delay: 4000 },
  { speaker: 'owner', text: "Maybe – what would that involve?", delay: 2000 },
  { speaker: 'agent', text: "It's very straightforward. They'll share:\n- Footfall and catchment data for Pentagon\n- How your category is currently under-served and its potential\n- Unit sizes and rental ranges that could work for you\n\nThere's no commitment — it's just an initial conversation to see if it's worth exploring further.\n\nWould mornings or afternoons usually work better for you?", delay: 3500 },
  { speaker: 'owner', text: "Afternoons, usually.", delay: 1500 },
  { speaker: 'agent', text: "Great, thank you. Looking at next week, would Tuesday at 3pm or Thursday at 2:30pm be better?", delay: 2000 },
  { speaker: 'owner', text: "Let's do Tuesday at 3.", delay: 1500 },
  { speaker: 'agent', text: "Perfect. I've booked you in for Tuesday at 3pm for a 15–20 minute call with Charlene from the Pentagon leasing team. We'll send you a quick SMS reminder with the details. Thanks very much, Sarah — have a great day.", delay: 2500 },
  { speaker: 'owner', text: "You too. Speak next week.", delay: 1000 },
]

export function AIVoiceCallClient() {
  const params = useParams()
  const router = useRouter()
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([])
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0)

  // Auto-scroll transcript to bottom when new messages are added
  useEffect(() => {
    const transcriptContainer = document.getElementById('transcript-container')
    if (transcriptContainer && transcript.length > 0) {
      transcriptContainer.scrollTop = transcriptContainer.scrollHeight
    }
  }, [transcript])

  const startCall = () => {
    setCallStatus('connecting')
    setTranscript([]) // Reset transcript
    setTimeout(() => {
      setCallStatus('ringing')
      setTimeout(() => {
        setCallStatus('in-progress')
        // Start showing transcript
        let index = 0
        const showNext = () => {
          if (index < mockTranscript.length) {
            const item = mockTranscript[index]
            setTimeout(() => {
              setTranscript(prev => [...prev, { speaker: item.speaker, text: item.text }])
              setCurrentTranscriptIndex(index)
              index++
              showNext()
            }, item.delay)
          } else {
            // Call completed - always show appointment booked for demo
            setTimeout(() => {
              setCallStatus('appointment-booked')
            }, 1000)
          }
        }
        showNext()
      }, 2000)
    }, 1500)
  }

  const businessName = "Sarah's Kitchen"
  const businessAddress = "High Street, Chatham"
  const gapCategory = "Fast Casual Dining"
  const locationName = "Pentagon Shopping Centre"

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                AI Voice Call
              </CardTitle>
              <CardDescription>
                {businessName} • {businessAddress}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Call Setup Info */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Business</div>
                  <div className="font-medium">{businessName}</div>
                  <div className="text-sm text-muted-foreground">{businessAddress}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Gap Category</div>
                  <div className="font-medium">{gapCategory}</div>
                  <div className="text-sm text-muted-foreground">{locationName}</div>
                </div>
              </div>

              {/* Call Status */}
              {callStatus === 'idle' && (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-6">
                      <Phone className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ready to place call</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The AI agent will call {businessName} to discuss the {gapCategory.toLowerCase()} opportunity at {locationName}.
                    </p>
                    <Button onClick={startCall} size="lg" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Start AI Call
                    </Button>
                  </div>
                </div>
              )}

              {(callStatus === 'connecting' || callStatus === 'ringing') && (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-6 animate-pulse">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {callStatus === 'connecting' ? 'Connecting...' : 'Ringing...'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {callStatus === 'connecting' 
                        ? 'Establishing connection...' 
                        : 'Waiting for answer...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Transcript */}
              {(callStatus === 'in-progress' || callStatus === 'completed' || callStatus === 'appointment-booked' || callStatus === 'no-answer') && transcript.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Live Transcript</h3>
                    <Badge variant={callStatus === 'in-progress' ? 'secondary' : 'default'}>
                      {callStatus === 'in-progress' ? 'In Progress' : 
                       callStatus === 'appointment-booked' ? 'Completed' :
                       callStatus === 'no-answer' ? 'No Answer' : 'Completed'}
                    </Badge>
                  </div>
                  <div 
                    id="transcript-container"
                    className="border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto space-y-3"
                  >
                    {transcript.map((item, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                          item.speaker === 'agent' ? "justify-start" : "justify-end"
                        )}
                      >
                        {item.speaker === 'agent' && (
                          <div className="rounded-full bg-primary/10 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className={cn(
                          "rounded-lg p-3 max-w-[80%]",
                          item.speaker === 'agent' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-background border"
                        )}>
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {item.speaker === 'agent' ? 'AI Agent' : 'Business Owner'}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{item.text}</div>
                        </div>
                        {item.speaker === 'owner' && (
                          <div className="rounded-full bg-muted p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {callStatus === 'in-progress' && (
                      <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Call in progress...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Call Outcome */}
              {callStatus === 'appointment-booked' && (
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-green-500/20 p-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Appointment Booked
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Business:</span> {businessName}</div>
                          <div><span className="font-medium">Meeting:</span> Intro call booked</div>
                          <div><span className="font-medium">Time:</span> Tuesday at 3:00pm</div>
                          <div><span className="font-medium">Duration:</span> 15-20 minutes</div>
                          <div className="pt-2 text-xs text-muted-foreground">
                            Synced to leasing team calendar • SMS reminder sent
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {callStatus === 'no-answer' && (
                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-orange-500/20 p-3">
                        <PhoneOff className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">No Answer</h3>
                        <p className="text-sm text-muted-foreground">
                          The call was not answered. You can try again later or use an alternative contact method.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {(callStatus === 'appointment-booked' || callStatus === 'no-answer') && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    Back to Outreach
                  </Button>
                  {callStatus === 'no-answer' && (
                    <Button onClick={startCall}>
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

