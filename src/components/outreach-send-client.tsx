"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export type OutreachChannel = { kind: string; icon: string; label: string; value: string; href?: string }
export type OutreachResult = { name: string; channels: OutreachChannel[]; message: string }

export function OutreachSendClient({ results }: { results: OutreachResult[] }) {
  const [sent, setSent] = useState<Record<number, boolean>>({})
  const [sending, setSending] = useState<Record<number, boolean>>({})

  const sendOne = async (idx: number) => {
    setSending((s) => ({ ...s, [idx]: true }))
    await new Promise((r) => setTimeout(r, 700))
    setSending((s) => ({ ...s, [idx]: false }))
    setSent((s) => ({ ...s, [idx]: true }))
  }

  return (
    <div className="space-y-4">
      {results.map((r, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{r.name}</CardTitle>
              <Badge variant={sent[i] ? "default" : "secondary"}>{sent[i] ? "Sent" : "Prepared"}</Badge>
            </div>
            <CardDescription className="flex flex-wrap gap-2">
              {r.channels.map((c, j) => (
                c.href ? (
                  <a key={j} className="underline" href={c.href} target="_blank" rel="noreferrer">{c.value}</a>
                ) : (
                  <span key={j}>{c.value}</span>
                )
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Separator />
            <div className="text-sm font-medium">Draft outreach message</div>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">{r.message}</pre>
            <div className="pt-2">
              <Button onClick={() => sendOne(i)} disabled={!!sent[i] || !!sending[i]}>
                {sent[i] ? "Sent" : sending[i] ? "Sending…" : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


