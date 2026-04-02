"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Mail, MailX, Loader2 } from "lucide-react"
import { updateNotificationSettings } from "@/app/crm/actions"

export function DigestToggle({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled)
    const [isPending, startTransition] = useTransition()

    const handleToggle = (checked: boolean) => {
        setEnabled(checked) // Optimistic
        startTransition(async () => {
            try {
                await updateNotificationSettings({ digestEnabled: checked })
            } catch {
                setEnabled(!checked) // Rollback
            }
        })
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors hover:bg-muted/50">
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : enabled ? (
                        <Mail className="h-4 w-4 text-emerald-400" />
                    ) : (
                        <MailX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                        id="digest-toggle"
                        checked={enabled}
                        onCheckedChange={handleToggle}
                        disabled={isPending}
                        aria-label="Daily digest email"
                    />
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p className="text-xs">
                    {enabled ? "Daily digest on — 7 AM email summary" : "Daily digest off"}
                </p>
            </TooltipContent>
        </Tooltip>
    )
}
