"use client"

import { useState } from "react"
import { V2Navigation } from "@/components/v2-navigation"
import { V2Footer } from "@/components/v2-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Calendar,
    Clock,
    Phone,
    Mail,
    MapPin,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Users,
    Building2,
    MessageCircle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
]

const benefits = [
    { icon: Building2, title: "Premium Locations", desc: "Access high-footfall shopping centres" },
    { icon: Users, title: "Expert Support", desc: "Dedicated regional manager" },
    { icon: Sparkles, title: "Flexible Terms", desc: "Pop-ups to permanent spaces" },
]

export default function BookAppointmentPage() {
    const [selectedDate, setSelectedDate] = useState<string>("")
    const [selectedTime, setSelectedTime] = useState<string>("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        business: "",
        message: ""
    })

    // Generate next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i + 1)
        return date
    }).filter(d => d.getDay() !== 0 && d.getDay() !== 6) // Exclude weekends

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock calendar integration - would redirect to Calendly/Cal.com
        window.open(`https://calendly.com/flourish-demo?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`, '_blank')
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <V2Navigation forceSolid={true} useAbsoluteLinks={true} />

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#4D4A46] via-[#5a5753] to-[#4D4A46] py-16 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, #E6FB60 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                        }} />
                    </div>

                    <div className="container mx-auto px-4 relative">
                        <div className="max-w-3xl mx-auto text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6FB60]/20 border border-[#E6FB60]/30 text-sm text-[#E6FB60]">
                                <Calendar className="h-4 w-4" />
                                Book Your Free Consultation
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                Let&apos;s Find Your{" "}
                                <span className="text-[#E6FB60]">Perfect Space</span>
                            </h1>

                            <p className="text-xl text-white/70 max-w-2xl mx-auto">
                                Schedule a free 30-minute call with one of our Regional Managers
                                to discuss your retail opportunity.
                            </p>

                            {/* Quick Benefits */}
                            <div className="flex flex-wrap justify-center gap-6 pt-4">
                                {benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-white/80">
                                        <benefit.icon className="h-5 w-5 text-[#E6FB60]" />
                                        <span className="text-sm">{benefit.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-16 bg-[#F7F4F2]">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                            {/* Booking Form */}
                            <div className="lg:col-span-2">
                                <Card className="border-[#D8D8D6] shadow-lg bg-white">
                                    <CardContent className="p-6 md:p-8">
                                        <h2 className="text-2xl font-bold text-[#4D4A46] mb-6 flex items-center gap-2">
                                            <Calendar className="h-6 w-6 text-[#E6FB60]" />
                                            Book Your Appointment
                                        </h2>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Date Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#4D4A46] mb-3">
                                                    Select a Date
                                                </label>
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {dates.slice(0, 7).map((date) => {
                                                        const dateStr = date.toISOString().split('T')[0]
                                                        const isSelected = selectedDate === dateStr
                                                        return (
                                                            <button
                                                                key={dateStr}
                                                                type="button"
                                                                onClick={() => setSelectedDate(dateStr)}
                                                                className={`flex-shrink-0 p-3 rounded-lg border-2 text-center min-w-[70px] transition-all ${isSelected
                                                                    ? 'border-[#E6FB60] bg-[#E6FB60] text-[#4D4A46]'
                                                                    : 'border-[#D8D8D6] bg-white text-[#4D4A46] hover:border-[#4D4A46]/30'
                                                                    }`}
                                                            >
                                                                <div className="text-xs font-medium">
                                                                    {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                                                                </div>
                                                                <div className="text-lg font-bold">{date.getDate()}</div>
                                                                <div className="text-xs">
                                                                    {date.toLocaleDateString('en-GB', { month: 'short' })}
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            {/* Time Selection */}
                                            {selectedDate && (
                                                <div>
                                                    <label className="block text-sm font-medium text-[#4D4A46] mb-3">
                                                        Select a Time
                                                    </label>
                                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                                        {timeSlots.map((time) => (
                                                            <button
                                                                key={time}
                                                                type="button"
                                                                onClick={() => setSelectedTime(time)}
                                                                className={`p-2 rounded-lg border text-sm font-medium transition-all ${selectedTime === time
                                                                    ? 'border-[#E6FB60] bg-[#E6FB60] text-[#4D4A46]'
                                                                    : 'border-[#D8D8D6] bg-white text-[#4D4A46] hover:border-[#4D4A46]/30'
                                                                    }`}
                                                            >
                                                                {time}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact Details */}
                                            {selectedTime && (
                                                <div className="space-y-4 pt-4 border-t border-[#D8D8D6]">
                                                    <h3 className="font-semibold text-[#4D4A46]">Your Details</h3>

                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-[#4D4A46] mb-1">
                                                                Full Name *
                                                            </label>
                                                            <Input
                                                                required
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                placeholder="Your name"
                                                                className="border-[#D8D8D6]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-[#4D4A46] mb-1">
                                                                Business Name
                                                            </label>
                                                            <Input
                                                                value={formData.business}
                                                                onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                                                                placeholder="Your business"
                                                                className="border-[#D8D8D6]"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-[#4D4A46] mb-1">
                                                                Email *
                                                            </label>
                                                            <Input
                                                                required
                                                                type="email"
                                                                value={formData.email}
                                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                placeholder="you@example.com"
                                                                className="border-[#D8D8D6]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-[#4D4A46] mb-1">
                                                                Phone
                                                            </label>
                                                            <Input
                                                                type="tel"
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                placeholder="07xxx xxxxxx"
                                                                className="border-[#D8D8D6]"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-[#4D4A46] mb-1">
                                                            Tell us about your business
                                                        </label>
                                                        <Textarea
                                                            value={formData.message}
                                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                            placeholder="What type of retail space are you looking for?"
                                                            className="border-[#D8D8D6] min-h-[100px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={!selectedDate || !selectedTime || !formData.name || !formData.email}
                                                className="w-full bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold text-lg gap-2 disabled:opacity-50"
                                            >
                                                <Calendar className="h-5 w-5" />
                                                Confirm Appointment
                                                <ArrowRight className="h-5 w-5" />
                                            </Button>

                                            <p className="text-xs text-center text-[#4D4A46]/60">
                                                By booking, you agree to our terms. We&apos;ll send confirmation to your email.
                                            </p>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Info Sidebar */}
                            <div className="space-y-6">
                                {/* What to Expect */}
                                <Card className="border-[#D8D8D6] bg-white">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold text-[#4D4A46] mb-4 flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-[#E6FB60]" />
                                            What to Expect
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                "30-minute discovery call",
                                                "Discuss your business needs",
                                                "Explore available locations",
                                                "Get pricing information",
                                                "Next steps & timeline"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-[#4D4A46]">
                                                    <CheckCircle2 className="h-4 w-4 text-[#E6FB60] flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Contact Details */}
                                <Card className="border-[#D8D8D6] bg-[#4D4A46] text-white">
                                    <CardContent className="p-6">
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5 text-[#E6FB60]" />
                                            Prefer to Call?
                                        </h3>
                                        <div className="space-y-4">
                                            <a
                                                href="tel:+442073588125"
                                                className="flex items-center gap-3 hover:text-[#E6FB60] transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-[#E6FB60]/20 flex items-center justify-center">
                                                    <Phone className="h-5 w-5 text-[#E6FB60]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white/60">Call us</div>
                                                    <div className="font-semibold">(+44) 020 7358 8125</div>
                                                </div>
                                            </a>

                                            <a
                                                href="mailto:hello@thisisflourish.co.uk"
                                                className="flex items-center gap-3 hover:text-[#E6FB60] transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-[#E6FB60]/20 flex items-center justify-center">
                                                    <Mail className="h-5 w-5 text-[#E6FB60]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white/60">Email us</div>
                                                    <div className="font-semibold">hello@thisisflourish.co.uk</div>
                                                </div>
                                            </a>

                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#E6FB60]/20 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="h-5 w-5 text-[#E6FB60]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-white/60">Office</div>
                                                    <div className="font-semibold text-sm">
                                                        Flourish HQ<br />
                                                        United Kingdom
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Trust Badge */}
                                <Card className="border-[#E6FB60] bg-[#E6FB60]/10">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#E6FB60] flex items-center justify-center mx-auto mb-3">
                                            <Users className="h-6 w-6 text-[#4D4A46]" />
                                        </div>
                                        <p className="font-bold text-[#4D4A46]">500+ Traders Supported</p>
                                        <p className="text-sm text-[#4D4A46]/70">
                                            Join hundreds of successful businesses trading in our centres
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-12 bg-[#4D4A46]">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-white/70 mb-4">
                            Not ready to book? Explore our locations first.
                        </p>
                        <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                            <Link href="/#locations">
                                View Our Locations
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <V2Footer />
        </div>
    )
}
