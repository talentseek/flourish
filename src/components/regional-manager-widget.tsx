"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, X, Phone, Mail } from "lucide-react"
import Image from "next/image"

interface RegionalManagerWidgetProps {
    name: string
    phone?: string
    email?: string
    imageSrc: string
}

export function RegionalManagerWidget({ name, phone, email, imageSrc }: RegionalManagerWidgetProps) {
    const [isMinimized, setIsMinimized] = useState(true)

    // When minimized, show just a small floating button with the RM's face
    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsMinimized(false)}
                    size="lg"
                    className="rounded-full shadow-lg h-16 w-16 p-0 overflow-hidden border-2 border-white hover:scale-105 transition-transform"
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
            </div>
        )
    }

    // When expanded, show the full interface
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
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{name}</h3>
                                <p className="text-xs text-[#E6FB60]">Regional Manager</p>
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

                    {/* Content */}
                    <div className="bg-white p-6 space-y-6">
                        <div className="bg-[#F7F4F2] p-4 rounded-lg rounded-tl-none border border-[#D8D8D6]">
                            <p className="text-[#4D4A46]">
                                Hi, I&apos;m {name.split(' ')[0]}. Do you need any assistance with this site?
                            </p>
                        </div>

                        <div className="space-y-3">
                            {phone && (
                                <Button asChild variant="outline" className="w-full justify-start gap-3 border-[#4D4A46] text-[#4D4A46] hover:bg-[#E6FB60] hover:text-[#4D4A46] hover:border-[#E6FB60]">
                                    <a href={`tel:${phone.replace(/\s/g, '')}`}>
                                        <Phone className="h-4 w-4" />
                                        Call me: {phone}
                                    </a>
                                </Button>
                            )}

                            {email && (
                                <Button asChild variant="outline" className="w-full justify-start gap-3 border-[#4D4A46] text-[#4D4A46] hover:bg-[#E6FB60] hover:text-[#4D4A46] hover:border-[#E6FB60]">
                                    <a href={`mailto:${email}`}>
                                        <Mail className="h-4 w-4" />
                                        Email me
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
