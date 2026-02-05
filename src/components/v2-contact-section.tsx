"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Quote, Phone, Shield, CheckCircle2 } from "lucide-react"

export function V2ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <section id="contact" className="py-16 bg-[#F7F4F2]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
            Let&apos;s Work Together
          </h2>
          <p className="text-lg text-[#4D4A46] font-medium">
            Whether you&apos;re a landlord looking to unlock opportunities or a trader ready to take
            your business to the next level — we&apos;d love to hear from you.
          </p>
        </div>

        {/* Tailored Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="border-[#D8D8D6] text-center">
            <CardHeader>
              <CardTitle className="text-xl text-[#4D4A46]">New Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enquiry form linking to your trader onboarding team
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
              >
                <a href="#contact-form">Trader Enquiry</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] text-center">
            <CardHeader>
              <CardTitle className="text-xl text-[#4D4A46]">Landlords & Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Contact for property or commercialisation discussions
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
              >
                <a href="#contact-form">Landlord Enquiry</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] text-center">
            <CardHeader>
              <CardTitle className="text-xl text-[#4D4A46]">General Enquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                For everything else
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
              >
                <a href="#contact-form">General Enquiry</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div id="contact-form" className="max-w-2xl mx-auto mb-12">
          <Card className="border-[#D8D8D6]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#4D4A46]">Get in Touch</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you within 2 working days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-[#E6FB60] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-[#4D4A46] mb-2">Thank you!</h3>
                  <p className="text-muted-foreground">
                    Our team will be in touch within 2 working days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#4D4A46]">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="border-[#D8D8D6]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#4D4A46]">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="border-[#D8D8D6]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#4D4A46]">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="border-[#D8D8D6]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enquiryType" className="text-[#4D4A46]">Enquiry Type *</Label>
                    <Select
                      value={formData.enquiryType}
                      onValueChange={(value) => handleChange("enquiryType", value)}
                      required
                    >
                      <SelectTrigger className="border-[#D8D8D6]">
                        <SelectValue placeholder="Select enquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trader">Trader</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#4D4A46]">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="border-[#D8D8D6]"
                      placeholder="Tell us about your enquiry..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-[#4D4A46]">
                      Upload File (optional) - For traders to share images of kiosk/product
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      className="border-[#D8D8D6]"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 font-semibold"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Book a Call */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-[#4D4A46] mb-8">
            <Phone className="h-5 w-5" />
            <span className="font-semibold text-lg">Prefer to talk?</span>
          </div>
          <div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#4D4A46] bg-[#4D4A46] text-white hover:bg-[#4D4A46]/90 text-lg px-8 py-6"
            >
              <a href="mailto:info@flourish.com?subject=Book a Call">Book a Call</a>
            </Button>
          </div>
        </div>

        {/* Testimonial & Brand Promise */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="border-[#D8D8D6] bg-white">
            <CardHeader>
              <Quote className="h-6 w-6 text-[#E6FB60] mb-2" />
            </CardHeader>
            <CardContent>
              <p className="text-[#4D4A46] italic mb-4 font-medium">
                &quot;Working with Flourish has been transformational for our business — they are always proactive, dependable, and ready to help at a moment&apos;s notice.&quot;
              </p>
              <p className="font-semibold text-[#4D4A46]">— Rukhsana, Spud Haven, One Stop Perry Barr</p>
            </CardContent>
          </Card>

          <Card className="border-[#D8D8D6] bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-[#4D4A46]">Our Brand Promise</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#4D4A46] font-medium">
                We&apos;re on the ground, across the UK, helping traders and landlords flourish together.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trust & Compliance */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-[#E6FB60]" />
            <p className="text-sm text-[#4D4A46] font-medium">
              <strong className="text-[#4D4A46]">Trust & Compliance:</strong> Your information is
              confidential and will only be used to respond to your enquiry.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            <a href="/privacy" className="text-[#4D4A46] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}


