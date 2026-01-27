
import React from "react";
import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <div className="z-10 w-full max-w-md p-6">
                <div className="flex flex-col items-center mb-8">
                    {/* Replace with your Logo if you have one, or text */}
                    <h1 className="text-3xl font-bold tracking-tighter text-white">
                        Flourish
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2">Retail Intelligence Engine</p>
                </div>

                {children}
            </div>
        </div>
    );
}
