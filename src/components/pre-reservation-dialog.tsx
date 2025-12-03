"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Lock } from "lucide-react"

interface PreReservationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PreReservationDialog({ open, onOpenChange }: PreReservationDialogProps) {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true)
        }, 1000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-[#E6FB60] border-2 bg-[#4D4A46] text-white p-0 overflow-hidden gap-0">
                {/* Header Section with Visual */}
                <div className="relative h-32 bg-gradient-to-r from-[#4D4A46] to-black overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] bg-repeat" />
                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="p-3 bg-[#E6FB60]/20 rounded-full backdrop-blur-sm border border-[#E6FB60]/50">
                            <Sparkles className="h-8 w-8 text-[#E6FB60]" />
                        </div>
                        <p className="text-[#E6FB60] font-medium text-sm tracking-wider uppercase">Coming Soon</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center text-white">Flourish AI - Pre Reservation</DialogTitle>
                        <DialogDescription className="text-center text-gray-300 text-base">
                            Experience the future of retail property analytics. Join our exclusive waitlist for full access to advanced comparison tools and AI insights.
                        </DialogDescription>
                    </DialogHeader>

                    {submitted ? (
                        <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto w-16 h-16 bg-[#E6FB60] rounded-full flex items-center justify-center">
                                <Lock className="h-8 w-8 text-[#4D4A46]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#E6FB60]">You&apos;re on the list!</h3>
                                <p className="text-gray-300">We&apos;ll notify you as soon as spots open up.</p>
                            </div>
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="bg-white text-[#4D4A46] hover:bg-gray-200 w-full mt-4"
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-200">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E6FB60] focus:ring-[#E6FB60]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-200">Work Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E6FB60] focus:ring-[#E6FB60]"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[#E6FB60] text-[#4D4A46] hover:bg-[#d4e850] font-bold text-lg h-12"
                            >
                                Join Waitlist
                            </Button>
                            <p className="text-xs text-center text-gray-400">
                                Limited spots available for the beta program.
                            </p>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
