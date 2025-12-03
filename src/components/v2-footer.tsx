import { Facebook, Linkedin, Instagram } from "lucide-react"

export function V2Footer() {
    return (
        <footer className="border-t border-[#D8D8D6] bg-[#4D4A46] text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                    <p>© {new Date().getFullYear()} Flourish. All rights reserved.</p>

                    {/* Social Media Icons */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.facebook.com/p/This-is-Flourish-61555483902273/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="Facebook"
                        >
                            <Facebook className="h-6 w-6 text-[#E6FB60]" />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/this-is-flourish"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="h-6 w-6 text-[#E6FB60]" />
                        </a>
                        <a
                            href="https://www.instagram.com/this_is_flourish/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            aria-label="Instagram"
                        >
                            <Instagram className="h-6 w-6 text-[#E6FB60]" />
                        </a>
                    </div>

                    <p>Made with ❤️ for retail property</p>
                </div>
            </div>
        </footer>
    )
}
