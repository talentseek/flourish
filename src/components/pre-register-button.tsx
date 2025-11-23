"use client"

import { useState } from "react"
import { Sparkles, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function PreRegisterButton() {
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Thanks for your interest!", {
      description: `We'll contact you at ${email} when Flourish launches. You're on the waitlist!`
    })
    
    setSubmitting(false)
    setOpen(false)
    setEmail("")
    setCompanyName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 bg-background text-foreground hover:bg-background/90 h-12 px-8 rounded-md font-medium transition-colors">
          Pre-Register for Early Access
          <ArrowRight className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Pre-Register for Early Access
          </DialogTitle>
          <DialogDescription>
            Join our waitlist and be the first to access Flourish AI when we launch. Get exclusive beta features and special launch pricing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePreRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cta-email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="cta-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-company">Company Name (Optional)</Label>
            <Input
              id="cta-company"
              type="text"
              placeholder="Your company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              By pre-registering, you&apos;ll receive early access to Flourish AI, exclusive beta features,
              and special launch pricing.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email || submitting}
              className="flex-1"
            >
              {submitting ? "Submitting..." : "Join Waitlist"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

