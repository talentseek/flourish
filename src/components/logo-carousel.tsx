"use client"

import Image from "next/image"

const logos = [
    { name: "CBRE", src: "/logos/cbre.png" },
    { name: "Colliers", src: "/logos/colliers.png" },
    { name: "Cushman & Wakefield", src: "/logos/cushman-wakefield.png" },
    { name: "Hammerson", src: "/logos/hammerson.png" },
    { name: "JLL", src: "/logos/jll.png" },
    { name: "Savills", src: "/logos/savills.png" },
    { name: "The LCP Group", src: "/logos/the-lcp-group.png" },
    { name: "Workman LLP", src: "/logos/workman-llp.png" },
]

export function LogoCarousel() {
    return (
        <div className="w-full mt-12">
            <p className="text-center text-sm mb-6 tracking-wide uppercase font-medium" style={{ color: '#e6fb60' }}>
                Proudly working with:
            </p>
            <div className="relative overflow-hidden">
                {/* Gradient fade on edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/50 to-transparent z-10 pointer-events-none" />

                {/* Scrolling container */}
                <div className="flex animate-scroll">
                    {/* First set of logos */}
                    {logos.map((logo) => (
                        <div
                            key={logo.name}
                            className="flex-shrink-0 mx-8 flex items-center justify-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                width={120}
                                height={50}
                                className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {logos.map((logo) => (
                        <div
                            key={`${logo.name}-dup`}
                            className="flex-shrink-0 mx-8 flex items-center justify-center"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.name}
                                width={120}
                                height={50}
                                className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
