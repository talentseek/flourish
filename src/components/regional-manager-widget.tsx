"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Phone, Mail, Send, Sparkles } from "lucide-react"
import Image from "next/image"

interface RegionalManagerWidgetProps {
    name: string
    phone?: string
    email?: string
    imageSrc: string
    locationName?: string
}

interface Message {
    id: string
    text: string
    isUser: boolean
    isTyping?: boolean
}

const quickQuestions = [
    "How do I become a retailer here?",
    "What spaces are available?",
    "What are the costs?",
    "Tell me about footfall"
]

// Mock responses based on keywords
const getMockResponse = (question: string, rmName: string, locationName?: string): string => {
    const q = question.toLowerCase()
    const location = locationName || "this shopping centre"

    if (q.includes("retailer") || q.includes("become") || q.includes("join") || q.includes("start")) {
        return `Great question! Becoming a retailer at ${location} is straightforward. We offer flexible terms from pop-ups to permanent spaces. I can guide you through the process - just fill out our interest form or give me a call and I'll personally walk you through the requirements, costs, and available spaces.`
    }
    if (q.includes("space") || q.includes("available") || q.includes("unit")) {
        return `We have several exciting opportunities at ${location}! From kiosk spaces perfect for pop-ups to larger retail units. Each space is in high-footfall areas. I can send you our current availability with photos and measurements - would you like me to email those to you?`
    }
    if (q.includes("cost") || q.includes("price") || q.includes("rent") || q.includes("fee")) {
        return `Our pricing is flexible and tailored to your needs. We work with businesses of all sizes and can structure deals from short-term pop-ups to longer leases. The best way to get accurate pricing is to have a quick chat - I can then give you a quote based on your specific requirements.`
    }
    if (q.includes("footfall") || q.includes("traffic") || q.includes("visitor") || q.includes("customer")) {
        return `${location} sees excellent footfall throughout the year. We track visitor numbers and can share detailed analytics including peak times, demographic data, and seasonal trends. This helps you plan your trading days for maximum impact. Would you like me to send you our footfall report?`
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        return `Hello! Welcome to ${location}. I'm ${rmName.split(' ')[0]}, your Regional Manager. I'm here to help with any questions about trading here, available spaces, or the application process. What would you like to know?`
    }
    if (q.includes("thank")) {
        return `You're very welcome! Don't hesitate to reach out if you have any more questions. I'm always happy to help. You can call or email me anytime using the buttons above. Looking forward to potentially welcoming you to ${location}! 🌟`
    }

    return `That's a great question! I'd be happy to help you with that. For the most accurate and detailed information, I'd recommend we have a quick chat. You can reach me directly using the call or email buttons above. I'm here to make your journey to trading at ${location} as smooth as possible.`
}

export function RegionalManagerWidget({ name, phone, email, imageSrc, locationName }: RegionalManagerWidgetProps) {
    const [isMinimized, setIsMinimized] = useState(true)
    const [showTooltip, setShowTooltip] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Show tooltip after 3 seconds, hide after 8 seconds
    useEffect(() => {
        if (isMinimized) {
            const showTimer = setTimeout(() => setShowTooltip(true), 3000)
            const hideTimer = setTimeout(() => setShowTooltip(false), 11000)
            return () => {
                clearTimeout(showTimer)
                clearTimeout(hideTimer)
            }
        } else {
            setShowTooltip(false)
        }
    }, [isMinimized])

    // Initialize with greeting when expanded
    useEffect(() => {
        if (!isMinimized && messages.length === 0) {
            setMessages([{
                id: '1',
                text: `Hi! I'm ${name.split(' ')[0]}, your Regional Manager for ${locationName || 'this location'}. I'm here to help you explore opportunities to trade here. What would you like to know?`,
                isUser: false
            }])
        }
    }, [isMinimized, messages.length, name, locationName])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            isUser: true
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsTyping(true)

        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

        const response = getMockResponse(text, name, locationName)

        setIsTyping(false)
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false
        }])
    }

    const handleQuickQuestion = (question: string) => {
        handleSendMessage(question)
    }

    // When minimized, show floating button with pulse animation
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
                {/* Tooltip bubble */}
                <div
                    className={`transition-all duration-500 ${showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                >
                    <div className="bg-white rounded-lg shadow-lg p-3 max-w-[200px] border-2 border-[#E6FB60] relative">
                        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white" />
                        <p className="text-sm text-[#4D4A46] font-medium">
                            👋 Need help exploring this location?
                        </p>
                    </div>
                </div>

                {/* Floating button with pulse */}
                <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-full bg-[#E6FB60] animate-ping opacity-30" />
                    <div className="absolute inset-[-4px] rounded-full bg-[#E6FB60]/20 animate-pulse" />

                    <Button
                        onClick={() => setIsMinimized(false)}
                        size="lg"
                        className="relative rounded-full shadow-lg h-16 w-16 p-0 overflow-hidden border-3 border-[#E6FB60] hover:scale-110 transition-transform duration-300 bg-white"
                        title={`Chat with ${name}`}
                    >
                        <Image
                            src={imageSrc}
                            alt={name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                        />
                        <span className="sr-only">Chat with {name}</span>
                    </Button>

                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
            </div>
        )
    }

    // When expanded, show the chatbot interface
    return (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm hidden md:block animate-in slide-in-from-bottom-5 duration-300">
            <Card className="shadow-xl border-2 border-[#E6FB60] overflow-hidden">
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-[#4D4A46] p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#E6FB60]">
                                <Image
                                    src={imageSrc}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#4D4A46]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm flex items-center gap-1">
                                    {name}
                                    <Sparkles className="h-3 w-3 text-[#E6FB60]" />
                                </h3>
                                <p className="text-xs text-[#E6FB60]">Regional Manager • Online</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMinimized(true)}
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Contact Buttons */}
                    <div className="bg-[#4D4A46]/90 px-4 py-2 flex gap-2">
                        {phone && (
                            <Button asChild size="sm" className="flex-1 gap-2 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/80 text-xs">
                                <a href={`tel:${phone.replace(/\s/g, '')}`}>
                                    <Phone className="h-3 w-3" />
                                    Call
                                </a>
                            </Button>
                        )}
                        {email && (
                            <Button asChild size="sm" className="flex-1 gap-2 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/80 text-xs">
                                <a href={`mailto:${email}`}>
                                    <Mail className="h-3 w-3" />
                                    Email
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="bg-[#F7F4F2] h-[280px] overflow-y-auto p-4 space-y-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-lg text-sm ${message.isUser
                                        ? 'bg-[#4D4A46] text-white rounded-br-none'
                                        : 'bg-white border border-[#D8D8D6] text-[#4D4A46] rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-[#D8D8D6] text-[#4D4A46] rounded-lg rounded-bl-none p-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-[#4D4A46]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-[#4D4A46]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-[#4D4A46]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="bg-white border-t border-[#D8D8D6] p-3">
                            <p className="text-xs text-[#4D4A46]/60 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-1">
                                {quickQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuickQuestion(q)}
                                        className="text-xs bg-[#F7F4F2] hover:bg-[#E6FB60] text-[#4D4A46] px-2 py-1 rounded-full border border-[#D8D8D6] hover:border-[#E6FB60] transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="bg-white border-t border-[#D8D8D6] p-3">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSendMessage(inputValue)
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 text-sm border-[#D8D8D6] focus-visible:ring-[#E6FB60] text-[#4D4A46]"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!inputValue.trim() || isTyping}
                                className="bg-[#4D4A46] text-white hover:bg-[#E6FB60] hover:text-[#4D4A46] px-3"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
