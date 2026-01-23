"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

interface DemoRequestModalProps {
    trigger: React.ReactNode
    variant?: "landsec" | "default"
}

export function DemoRequestModal({ trigger, variant = "default" }: DemoRequestModalProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call - replace with actual API integration
        console.log("Demo request submitted:", formData)

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false)
            setOpen(false)
            setFormData({ name: "", email: "", company: "", phone: "", message: "" })
        }, 3000)
    }

    const isLandsec = variant === "landsec"
    const primaryColor = isLandsec ? "#E6FB60" : "#E6FB60"
    const bgColor = isLandsec ? "#002855" : "#4D4A46"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px]"
                style={{
                    backgroundColor: bgColor,
                    borderColor: `${primaryColor}30`,
                }}
            >
                {isSubmitted ? (
                    <div className="py-8 text-center space-y-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                            style={{ backgroundColor: `${primaryColor}20` }}
                        >
                            <CheckCircle2 className="h-8 w-8" style={{ color: primaryColor }} />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-white">
                            Thank You!
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                            We&apos;ve received your request and will be in touch shortly.
                        </DialogDescription>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white">
                                Request a Demo
                            </DialogTitle>
                            <DialogDescription className="text-white/70">
                                Fill out the form below and our team will get back to you within 24 hours.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-white">
                                        Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                        placeholder="John Smith"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white">
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                        placeholder="john@company.com"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-white">
                                        Company *
                                    </Label>
                                    <Input
                                        id="company"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                        placeholder="Landsec"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-white">
                                        Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                        placeholder="+44 20 1234 5678"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-white">
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                                    placeholder="Tell us about your portfolio and what you're looking to achieve..."
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full font-semibold"
                                style={{
                                    backgroundColor: primaryColor,
                                    color: bgColor,
                                }}
                            >
                                {isSubmitting ? "Submitting..." : "Request Demo"}
                            </Button>
                            <p className="text-xs text-white/50 text-center">
                                By submitting, you agree to our privacy policy. We&apos;ll never share your data.
                            </p>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
